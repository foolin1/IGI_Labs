from django import forms
from django.core.validators import RegexValidator, EmailValidator
from .models import Review, User, Auto
from django.contrib.auth.forms import UserChangeForm

class UserRegistrationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    password2 = forms.CharField(label='Confirm password', widget=forms.PasswordInput)
    is_adult = forms.BooleanField(required=True)

    class Meta:
        model = User
        fields = ['name', 'phone_number', 'password', 'email']

    def clean_phone_number(self):
        phone_number = self.cleaned_data.get('phone_number')
        validator = RegexValidator(regex=r'^\+37529\d{7}$', message="Phone number must be entered in the format: '+37529******'. Up to 9 digits allowed.")
        validator(phone_number)
        return phone_number

    def clean_email(self):
        email = self.cleaned_data.get('email')
        EmailValidator()(email)
        return email
    
    def clean_is_adult(self):
        is_adult = self.cleaned_data.get('is_adult')
        if not is_adult:
            raise forms.ValidationError("You must be 18 years old or older to register")
        return is_adult

    def clean_password2(self):
        password = self.cleaned_data.get('password')
        password2 = self.cleaned_data.get('password2')
        if password and password2 and password != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user

class LoginForm(forms.Form):
    phone_number = forms.CharField(label='Phone Number', max_length=13)
    password = forms.CharField(label='Password', widget=forms.PasswordInput)

class AutoForm(forms.ModelForm):
    class Meta:
        model = Auto
        fields = ['number', 'auto_model']

class ReplenishBalanceForm(forms.Form):
    amount = forms.DecimalField(label='Сумма', min_value=0.01, decimal_places=2, max_digits=10)

class UserUpdateForm(forms.ModelForm):
    phone_number = forms.CharField(validators=[RegexValidator(regex=r'^\+37529\d{7}$', message="Phone number must be entered in the format: '+37529******'. Up to 9 digits allowed.")])
    email = forms.EmailField(validators=[EmailValidator()])

    class Meta:
        model = User
        fields = ['name', 'phone_number', 'email']

    def clean_phone_number(self):
        phone_number = self.cleaned_data.get('phone_number')
        validator = RegexValidator(regex=r'^\+37529\d{7}$', message="Phone number must be entered in the format: '+37529******'. Up to 9 digits allowed.")
        validator(phone_number)
        return phone_number

    def clean_email(self):
        email = self.cleaned_data.get('email')
        EmailValidator()(email)
        return email


class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['rating', 'description']