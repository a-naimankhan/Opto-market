import json
from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from api.models import Product, UserProfile
from chat.models import ChatMessage


User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        parsed_ids = self._parse_room_name(self.room_name)
        if parsed_ids is None:
            await self.close(code=4001)
            return

        self.buyer_id, self.seller_id = parsed_ids
        self.user = await self._authenticate_user()
        if not self.user:
            await self.close(code=4003)
            return

        is_allowed = await self._is_allowed_participant(self.user.id, self.buyer_id, self.seller_id)
        if not is_allowed:
            await self.close(code=4003)
            return

        self.room_group_name = f"chatroom_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        room_group_name = getattr(self, "room_group_name", None)
        if room_group_name:
            await self.channel_layer.group_discard(room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            payload = json.loads(text_data)
        except json.JSONDecodeError:
            return

        message = (payload.get("message") or "").strip()
        if not message:
            return

        receiver_id = self.seller_id if self.user.id == self.buyer_id else self.buyer_id
        chat_message = await self._save_message(self.user.id, receiver_id, self.room_name, message)
        event = {
            "type": "chat.message",
            "message": chat_message["text"],
            "sender_id": chat_message["sender_id"],
            "receiver_id": chat_message["receiver_id"],
            "timestamp": chat_message["timestamp"],
            "room_name": chat_message["room_name"],
        }
        await self.channel_layer.group_send(self.room_group_name, event)

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "message": event["message"],
                    "sender_id": event["sender_id"],
                    "receiver_id": event["receiver_id"],
                    "timestamp": event["timestamp"],
                    "room_name": event["room_name"],
                }
            )
        )

    def _parse_room_name(self, room_name):
        parts = room_name.split("_")
        if len(parts) != 3 or parts[0] != "chat":
            return None
        try:
            buyer_id = int(parts[1])
            seller_id = int(parts[2])
        except ValueError:
            return None
        if buyer_id <= 0 or seller_id <= 0:
            return None
        return buyer_id, seller_id

    async def _authenticate_user(self):
        query = parse_qs(self.scope.get("query_string", b"").decode())
        token = (query.get("token") or [None])[0]
        if not token:
            return None

        jwt_auth = JWTAuthentication()
        try:
            validated_token = await sync_to_async(jwt_auth.get_validated_token)(token)
            user = await sync_to_async(jwt_auth.get_user)(validated_token)
            return user
        except (InvalidToken, TokenError, User.DoesNotExist):
            return None

    @database_sync_to_async
    def _is_allowed_participant(self, user_id, buyer_id, seller_id):
        if user_id not in {buyer_id, seller_id}:
            return False

        # Only allow buyer<->seller chats where seller owns at least one product.
        if not Product.objects.filter(owner_id=seller_id).exists():
            return False

        try:
            buyer_profile = UserProfile.objects.get(user_id=buyer_id)
            seller_profile = UserProfile.objects.get(user_id=seller_id)
        except UserProfile.DoesNotExist:
            return False

        return buyer_profile.role == "buyer" and seller_profile.role == "seller"

    @database_sync_to_async
    def _save_message(self, sender_id, receiver_id, room_name, text):
        message = ChatMessage.objects.create(
            sender_id=sender_id,
            receiver_id=receiver_id,
            room_name=room_name,
            text=text,
        )
        return {
            "sender_id": message.sender_id,
            "receiver_id": message.receiver_id,
            "room_name": message.room_name,
            "text": message.text,
            "timestamp": message.timestamp.isoformat(),
        }
