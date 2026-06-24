using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// <Purpose>
// Defines an interface for caching services.
// Providing the methods for managing caching within the application.
// </Purpose>

namespace LocalLLMApp.Services
{
    public interface ICacheService
    {
        void Set<T>(string key, T value, TimeSpan? expiry = null);
        T? Get<T>(string key);
        bool TryGet<T>(string key, out T? value);
        T GetOrSet<T>(string key, Func<T> factory, TimeSpan? expiry = null);
        Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null);
        void Remove(string key);
        void Clear();
    }
}
