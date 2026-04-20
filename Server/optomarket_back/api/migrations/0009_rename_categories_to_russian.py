from django.db import migrations


CATEGORY_RENAME = {
    'Fruits & Vegetables': 'Фрукты и овощи',
    'Foodgrains, Oil & Masala': 'Крупы, масло и специи',
    'Bakery, Cakes & Dairy': 'Выпечка и молочные продукты',
    'Beverages': 'Напитки',
    'Snacks & Branded Foods': 'Снеки и фирменные товары',
    'Beauty & Hygiene': 'Красота и гигиена',
    'Cuts & Sprouts': 'Нарезка и проростки',
    'Dal & Pulses': 'Бобовые',
    'Dry Fruits': 'Сухофрукты и орехи',
    'Cakes & Pastries': 'Торты и кондитерские изделия',
}


def rename_to_russian(apps, schema_editor):
    Category = apps.get_model('api', 'Category')
    for english, russian in CATEGORY_RENAME.items():
        Category.objects.filter(name=english).update(name=russian)


def rename_to_english(apps, schema_editor):
    Category = apps.get_model('api', 'Category')
    for english, russian in CATEGORY_RENAME.items():
        Category.objects.filter(name=russian).update(name=english)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_seed_default_categories'),
    ]

    operations = [
        migrations.RunPython(rename_to_russian, rename_to_english),
    ]
