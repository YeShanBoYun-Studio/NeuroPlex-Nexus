"""
Default configuration settings for NeuraCollab.
"""
from typing import Dict, Any

# Default workflow templates
WORKFLOW_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "relay": {
        "mode": "relay",
        "prompt_template": "Continue the story in the style of {role}",
        "inheritance_rules": {
            "full_history": False,
            "last_3_steps": True,
            "prompt_chain": True
        },
        "termination_conditions": {
            "max_steps": 10,
            "inactivity_timeout": 300
        },
        "roles": {
            "worldbuilder": {
                "model": "gpt-4",
                "instructions": "Focus on developing the setting and atmosphere"
            },
            "character_designer": {
                "model": "gpt-4",
                "instructions": "Focus on character development and interactions"
            },
            "plot_developer": {
                "model": "gpt-4",
                "instructions": "Focus on advancing the plot and creating tension"
            }
        }
    },
    "debate": {
        "mode": "debate",
        "prompt_template": "Analyze the argument and respond as {role}",
        "inheritance_rules": {
            "full_history": True,
            "last_3_steps": False,
            "prompt_chain": True
        },
        "termination_conditions": {
            "max_steps": 6,
            "inactivity_timeout": 600
        },
        "roles": {
            "proponent": {
                "model": "gpt-4",
                "instructions": "Support the main argument with evidence"
            },
            "opponent": {
                "model": "gpt-4",
                "instructions": "Challenge the argument with counterpoints"
            },
            "mediator": {
                "model": "gpt-4",
                "instructions": "Analyze both sides and suggest resolutions"
            }
        }
    }
}

# Default model settings
MODEL_DEFAULTS = {
    "gpt-4": {
        "temperature": 0.7,
        "max_tokens": 2000,
        "fallback_models": ["llama3"]
    },
    "llama3": {
        "temperature": 0.8,
        "max_tokens": 4000,
        "fallback_models": []
    }
}

# Cache settings
CACHE_DEFAULTS = {
    "max_size_mb": 100,
    "compression_enabled": True,
    "compression_threshold": 0.8,
    "summarization_enabled": True,
    "cleanup_interval": 3600  # 1 hour
}

# API settings
API_DEFAULTS = {
    "rate_limit": 60,  # requests per minute
    "timeout": 30,     # seconds
    "max_retries": 3
}

# Logging configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        }
    },
    "handlers": {
        "default": {
            "level": "INFO",
            "formatter": "standard",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout"
        },
        "file": {
            "level": "INFO",
            "formatter": "standard",
            "class": "logging.FileHandler",
            "filename": "logs/neuracollab.log",
            "mode": "a"
        }
    },
    "loggers": {
        "": {
            "handlers": ["default", "file"],
            "level": "INFO",
            "propagate": True
        }
    }
}
