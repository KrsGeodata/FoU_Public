using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Concurrent;
//using System.Timers;
using System.Threading;

// <Purpose>
// A service for caching data retrieved from the server, to avoid
// unnecessary API calls and improve performance.
// You can set an expiry time for cached items,
// after which they will be considered stale and removed on next access.
// NB! is vibe coded, but works like a charm
// </Purpose>

namespace LocalLLMApp.Services
{
    public class CacheService : ICacheService, IDisposable
    {
        private record CacheEntry(object Value, DateTimeOffset? ExpiresAt);

        private readonly ConcurrentDictionary<string, CacheEntry> _cache = new();
        private readonly Timer _cleanupTimer;
        private readonly int _maxEntries;
        private bool _disposed;

        public CacheService(int maxEntries = 1000, TimeSpan? cleanupInterval = null)
        {
            _maxEntries = maxEntries;
            var interval = cleanupInterval ?? TimeSpan.FromMinutes(3);
            _cleanupTimer = new Timer(RemoveExpiredEntries, null, interval, interval);
        }

        // Store any value under a string key with an optional expiry time
        public void Set<T>(string key, T value, TimeSpan? expiry = null)
        {
            // Evict one entry if at capacity and this is a new key
            if (!_cache.ContainsKey(key) && _cache.Count >= _maxEntries)
                EvictOne();

            var expiresAt = expiry.HasValue
                ? DateTimeOffset.UtcNow.Add(expiry.Value)
                : (DateTimeOffset?)null;

            _cache[key] = new CacheEntry(value!, expiresAt);
        }

        // Retrieve a value, returns null if missing or expired
        public T? Get<T>(string key)
        {
            TryGet<T>(key, out var value);
            return value;
        }

        // Same as Get but returns a bool indicating success - better for control flow
        public bool TryGet<T>(string key, out T? value)
        {
            if (_cache.TryGetValue(key, out var entry))
            {
                if (entry.ExpiresAt == null || entry.ExpiresAt > DateTimeOffset.UtcNow)
                {
                    // Safe pattern match avoids InvalidCastException on type mismatch
                    if (entry.Value is T typedValue)
                    {
                        value = typedValue;
                        return true;
                    }
                }
                _cache.TryRemove(key, out _); // Lazily clean up expired or mismatched entry
            }
            value = default;
            return false;
        }

        // Get a cached value or compute, store, and return it (sync)
        public T GetOrSet<T>(string key, Func<T> factory, TimeSpan? expiry = null)
        {
            if (TryGet<T>(key, out var cached))
                return cached!;

            var value = factory();
            Set(key, value, expiry);
            return value;
        }

        // Get a cached value or compute, store, and return it (async)
        public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null)
        {
            if (TryGet<T>(key, out var cached))
                return cached!;

            var value = await factory();
            Set(key, value, expiry);
            return value;
        }

        public void Remove(string key)
        {
            _cache.TryRemove(key, out _);
        }

        public void Clear()
        {
            _cache.Clear();
        }

        // Proactively sweep expired entries on a background timer
        private void RemoveExpiredEntries(object? state)
        {
            var now = DateTimeOffset.UtcNow;
            foreach (var kvp in _cache)
            {
                if (kvp.Value.ExpiresAt.HasValue && kvp.Value.ExpiresAt <= now)
                    _cache.TryRemove(kvp.Key, out _);
            }
        }

        // Evict one entry when the cache is at capacity:
        // prefers an expired entry, otherwise skips (no eviction of live entries)
        private void EvictOne()
        {
            var now = DateTimeOffset.UtcNow;
            var expired = _cache.FirstOrDefault(kvp =>
                kvp.Value.ExpiresAt.HasValue && kvp.Value.ExpiresAt <= now);

            if (expired.Key != null)
                _cache.TryRemove(expired.Key, out _);
        }

        public void Dispose()
        {
            if (_disposed) return;
            _cleanupTimer.Dispose();
            _disposed = true;
        }
    }
}
