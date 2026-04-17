from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_order_buyer_name_order_buyer_phone'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Verification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('verified', 'Verified'), ('rejected', 'Rejected')], default='pending', max_length=20)),
                ('id_document', models.ImageField(blank=True, null=True, upload_to='verifications/id/')),
                ('selfie', models.ImageField(blank=True, null=True, upload_to='verifications/selfie/')),
                ('video', models.FileField(blank=True, null=True, upload_to='verifications/video/')),
                ('admin_comment', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='verification', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]

