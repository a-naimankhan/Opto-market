from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_productreview'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='image',
            field=models.FileField(blank=True, null=True, upload_to='products/'),
        ),
    ]
