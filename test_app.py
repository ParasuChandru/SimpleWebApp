import pytest
from app import app, db, User
from flask_mail import Mail

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['MAIL_SUPPRESS_SEND'] = True
    mail = Mail(app)
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()

@pytest.fixture
def mail_outbox():
    mail = Mail(app)
    with mail.record_messages() as outbox:
        yield outbox

def register_user(client, username, email, password="SuperPassword123!"):
    return client.post('/register', data={
        'username': username,
        'email': email,
        'password': password,
        'confirm_password': password
    }, follow_redirects=True)

def test_registration_creates_unconfirmed_user(client):
    register_user(client, "testuser", "test@email.com")
    user = User.query.filter_by(email="test@email.com").first()
    assert user is not None
    assert not user.is_confirmed
    assert user.activation_token is not None

def test_registration_sends_email(client, mail_outbox):
    register_user(client, "testuser", "test@email.com")
    assert len(mail_outbox) == 1
    email = mail_outbox[0]
    assert "Please confirm your account" in email.body
    assert "test@email.com" in email.recipients

def test_cannot_login_unconfirmed(client):
    register_user(client, "testuser", "test@email.com")
    rv = client.post('/login', data={
        'email': 'test@email.com',
        'password': 'SuperPassword123!'
    }, follow_redirects=True)
    assert b'Email address not confirmed' in rv.data

def test_confirm_account_allows_login(client):
    register_user(client, "testuser", "test@email.com")
    user = User.query.filter_by(email="test@email.com").first()
    rv = client.get(f'/activate/{user.activation_token}', follow_redirects=True)
    updated = User.query.filter_by(email="test@email.com").first()
    assert updated.is_confirmed
    rv = client.post('/login', data={
        'email': 'test@email.com',
        'password': 'SuperPassword123!'
    }, follow_redirects=True)
    assert b'Login successful' in rv.data

def test_resend_confirmation(client, mail_outbox):
    register_user(client, "testuser", "test@email.com")
    user = User.query.filter_by(email='test@email.com').first()
    old_token = user.activation_token
    rv = client.post('/resend-confirmation', data={
        'email': 'test@email.com'
    }, follow_redirects=True)
    user2 = User.query.filter_by(email='test@email.com').first()
    assert old_token != user2.activation_token
    assert len(mail_outbox) == 1
    assert user2.activation_token in mail_outbox[0].body
    assert b'Confirmation email resent' in rv.data

def test_invalid_or_expired_activation(client):
    register_user(client, "testuser", "test@email.com")
    rv = client.get('/activate/invalidtoken', follow_redirects=True)
    assert b'Invalid or expired activation link' in rv.data
