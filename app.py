from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError
import secrets
from flask_mail import Mail, Message

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'

# MAIL CONFIG - SET THESE VALUES!
app.config['MAIL_SERVER'] = 'smtp.example.com'  # Replace with your SMTP server
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'your@email.com'
app.config['MAIL_PASSWORD'] = 'yourpassword'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(60), nullable=False)
    is_confirmed = db.Column(db.Boolean, default=False)
    activation_token = db.Column(db.String(120), nullable=True)

# Registration Form
class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=80)])
    email = StringField('Email', validators=[DataRequired(), Email(), Length(max=120)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('Username is already taken.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email is already registered.')

# Resend Confirmation Form
class ResendConfirmationForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Resend confirmation')

# Utility to send confirmation

def send_confirmation_email(user):
    link = url_for('activate', token=user.activation_token, _external=True)
    msg = Message("Confirm your account", sender="noreply@example.com", recipients=[user.email])
    msg.body = f"Welcome! Please confirm your account by clicking this link:\n\n{link}"
    mail.send(msg)

# Registration Route
@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        token = secrets.token_urlsafe(32)
        user = User(username=form.username.data, email=form.email.data, password_hash=hashed_password,
                    is_confirmed=False, activation_token=token)
        db.session.add(user)
        db.session.commit()
        send_confirmation_email(user)
        flash('Registration successful! Please confirm your email before logging in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

# Email Activation Route
@app.route('/activate/<token>')
def activate(token):
    user = User.query.filter_by(activation_token=token).first()
    if not user:
        flash('Invalid or expired activation link.', 'danger')
        return redirect(url_for('login'))
    user.is_confirmed = True
    user.activation_token = None
    db.session.commit()
    flash('Account confirmed. Please log in.', 'success')
    return redirect(url_for('login'))

# Resend Confirmation Route
@app.route('/resend-confirmation', methods=['GET', 'POST'])
def resend_confirmation():
    form = ResendConfirmationForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and not user.is_confirmed:
            user.activation_token = secrets.token_urlsafe(32)
            db.session.commit()
            send_confirmation_email(user)
            flash('Confirmation email resent.', 'success')
        else:
            flash('Email not found or already confirmed.', 'danger')
    return render_template('resend_confirmation.html', form=form)

# Login (blocks unconfirmed users)
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password_hash, password):
            if not user.is_confirmed:
                flash('Email address not confirmed. Check your email.', 'warning')
                return redirect(url_for('login'))
            flash('Login successful! (Stub)', 'success')
            return redirect(url_for('login'))
        else:
            flash('Invalid credentials', 'danger')
            return redirect(url_for('login'))
    return render_template('login.html')

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
