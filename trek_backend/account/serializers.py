from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

MAX_AVATAR_BYTES = 2 * 1024 * 1024  # 2 MB

SELF_SERVICE_ROLES = ('traveller', 'guide', 'agency', 'seller')



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'role', 'phone', 'profile_picture', 'bio')

    def validate_role(self, value):
        if value not in SELF_SERVICE_ROLES:
            raise serializers.ValidationError('Please choose a valid account type.')
        return value

    def validate_profile_picture(self, file):
        if file and file.size > MAX_AVATAR_BYTES:
            raise serializers.ValidationError('Image must be 2 MB or smaller.')
        return file

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            role=validated_data.get('role', 'traveller'),
            phone=validated_data.get('phone', ''),
            profile_picture=validated_data.get('profile_picture'),
            bio=validated_data.get('bio') or '',
        )
        user.set_password(validated_data['password'])
        user.save()
        return user



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'role', 'phone',
            'profile_picture', 'bio', 'is_verified', 'created_at',
        )
        read_only_fields = ('id', 'username', 'created_at')



class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'phone', 'profile_picture', 'bio', 'is_verified', 'created_at',
        )
        # role and is_verified must never be changed by the user
        read_only_fields = ('id', 'username', 'email', 'role', 'is_verified', 'created_at')

    def validate_profile_picture(self, file):
        if file and file.size > MAX_AVATAR_BYTES:
            raise serializers.ValidationError('Image must be 2 MB or smaller.')
        return file

    def validate_phone(self, value):
        cleaned = value.strip()
        digits = cleaned.replace('+', '').replace('-', '').replace(' ', '')
        if cleaned and not digits.isdigit():
            raise serializers.ValidationError('Enter a valid phone number.')
        return cleaned



class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError('Your current password is incorrect.')
        return value

    def validate_new_password(self, value):
        validate_password(value, self.context['request'].user)
        return value


# =========================
# LOGIN TOKEN
# =========================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data