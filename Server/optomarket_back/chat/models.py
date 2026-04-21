from django.conf import settings
from django.db import models


class ChatMessage(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_chat_messages"
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_chat_messages"
    )
    room_name = models.CharField(max_length=255, db_index=True)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"{self.sender_id}->{self.receiver_id} {self.timestamp.isoformat()}"
