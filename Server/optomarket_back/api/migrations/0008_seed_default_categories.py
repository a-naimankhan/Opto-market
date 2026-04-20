from django.db import migrations, models


DEFAULT_CATEGORIES = [
    'Fruits & Vegetables',
    'Foodgrains, Oil & Masala',
    'Bakery, Cakes & Dairy',
    'Beverages',
    'Snacks & Branded Foods',
    'Beauty & Hygiene',
    'Cuts & Sprouts',
    'Dal & Pulses',
    'Dry Fruits',
    'Cakes & Pastries',
]


def seed_categories(apps, schema_editor):
    Category = apps.get_model('api', 'Category')
    Product = apps.get_model('api', 'Product')

    normalized_categories = {}
    for category in Category.objects.all().order_by('id'):
        normalized_name = category.name.strip()
        if normalized_name in normalized_categories:
            Product.objects.filter(category=category).update(category=normalized_categories[normalized_name])
            category.delete()
            continue

        if normalized_name != category.name:
            category.name = normalized_name
            category.save(update_fields=['name'])

        normalized_categories[normalized_name] = category

    for name in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(name=name)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_verification'),
    ]

    operations = [
        migrations.RunPython(seed_categories, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='category',
            name='name',
            field=models.CharField(max_length=100, unique=True),
        ),
    ]