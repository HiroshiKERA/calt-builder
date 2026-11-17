"""
Re-export shim for `calt.preprocess`.

The canonical implementation now lives in the CALT library
(`calt/io/preprocess.py`, formerly `calt/preprocess.py`) so that any project
building on CALT can benefit from offline preprocessing without re-implementing
it.

This file is kept only for backwards compatibility with the small number of
imports that already write `from shared.preprocess import ...`. New code should
import from `calt.io.preprocess` directly (or from `shared.calt_adapter`, which
shims both the new and old module locations).

The calt-x version pinned in this project's pyproject.toml provides
`calt.io.preprocess`. If the import below fails, reinstall that exact version
(`pip install calt-x==<version in pyproject.toml>`) rather than upgrading.
"""

try:  # new calt-x: module relocated under calt.io
    from calt.io.preprocess import (  # noqa: F401
        PREPROCESS_VERSION,
        compute_config_hash,
        get_cache_dir,
        maybe_use_processed_cache,
        preprocess_to_ids,
        run_preprocess,
    )
except ImportError:  # old calt-x: module at top level
    from calt.preprocess import (  # noqa: F401
        PREPROCESS_VERSION,
        compute_config_hash,
        get_cache_dir,
        maybe_use_processed_cache,
        preprocess_to_ids,
        run_preprocess,
    )

__all__ = [
    "PREPROCESS_VERSION",
    "compute_config_hash",
    "get_cache_dir",
    "maybe_use_processed_cache",
    "preprocess_to_ids",
    "run_preprocess",
]
