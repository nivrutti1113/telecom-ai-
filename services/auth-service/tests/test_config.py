from app.config import Settings


def test_cors_origins_parses_comma_separated_env_value(monkeypatch):
    monkeypatch.setenv(
        "CORS_ORIGINS",
        "http://localhost:3000, https://dashboard.example.com ,",
    )

    settings = Settings()

    assert settings.cors_origins == [
        "http://localhost:3000",
        "https://dashboard.example.com",
    ]


def test_cors_origins_uses_default_origin(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)

    settings = Settings()

    assert settings.cors_origins == ["http://localhost:3000"]
