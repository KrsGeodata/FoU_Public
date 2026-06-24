using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LocalLLMApp.Models.EventArguments
{
    public class NavigationChangedEventArgs : EventArgs
    {
        public Type PageType { get; }
        public object SentObject { get; } = null;

        public NavigationChangedEventArgs(Type pageType, object sentObject = null) 
        { 
            PageType = pageType;
            SentObject = sentObject;
        }
    }
}
