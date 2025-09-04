from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a super admin user'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username for the super admin')
        parser.add_argument('--email', type=str, help='Email for the super admin')
        parser.add_argument('--password', type=str, help='Password for the super admin')
        parser.add_argument('--first-name', type=str, help='First name for the super admin')
        parser.add_argument('--last-name', type=str, help='Last name for the super admin')

    def handle(self, *args, **options):
        username = options.get('username') or input('Username: ')
        email = options.get('email') or input('Email: ')
        password = options.get('password') or input('Password: ')
        first_name = options.get('first_name') or input('First Name: ')
        last_name = options.get('last_name') or input('Last Name: ')

        try:
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.ERROR(f'User with email {email} already exists')
                )
                return

            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.ERROR(f'User with username {username} already exists')
                )
                return

            # Create super admin user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role='super_admin',
                is_activated=True,
                is_active=True,
                is_staff=True,
                is_superuser=True
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created super admin user: {user.email}'
                )
            )
            self.stdout.write(f'Username: {user.username}')
            self.stdout.write(f'Email: {user.email}')
            self.stdout.write(f'Role: {user.role}')

        except ValidationError as e:
            self.stdout.write(
                self.style.ERROR(f'Validation error: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating user: {e}')
            )
