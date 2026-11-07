var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS((exports, module) => {
  (function() {
    function defineDeprecationWarning(methodName, info) {
      Object.defineProperty(Component.prototype, methodName, {
        get: function() {
          console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]);
        }
      });
    }
    function getIteratorFn(maybeIterable) {
      if (maybeIterable === null || typeof maybeIterable !== "object")
        return null;
      maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
      return typeof maybeIterable === "function" ? maybeIterable : null;
    }
    function warnNoop(publicInstance, callerName) {
      publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
      var warningKey = publicInstance + "." + callerName;
      didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", callerName, publicInstance), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
    }
    function Component(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    function ComponentDummy() {}
    function PureComponent(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    function noop() {}
    function testStringCoercion(value) {
      return "" + value;
    }
    function checkKeyStringCoercion(value) {
      try {
        testStringCoercion(value);
        var JSCompiler_inline_result = false;
      } catch (e) {
        JSCompiler_inline_result = true;
      }
      if (JSCompiler_inline_result) {
        JSCompiler_inline_result = console;
        var JSCompiler_temp_const = JSCompiler_inline_result.error;
        var JSCompiler_inline_result$jscomp$0 = typeof Symbol === "function" && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
        JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
        return testStringCoercion(value);
      }
    }
    function getComponentNameFromType(type) {
      if (type == null)
        return null;
      if (typeof type === "function")
        return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
      if (typeof type === "string")
        return type;
      switch (type) {
        case REACT_FRAGMENT_TYPE:
          return "Fragment";
        case REACT_PROFILER_TYPE:
          return "Profiler";
        case REACT_STRICT_MODE_TYPE:
          return "StrictMode";
        case REACT_SUSPENSE_TYPE:
          return "Suspense";
        case REACT_SUSPENSE_LIST_TYPE:
          return "SuspenseList";
        case REACT_ACTIVITY_TYPE:
          return "Activity";
      }
      if (typeof type === "object")
        switch (typeof type.tag === "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof) {
          case REACT_PORTAL_TYPE:
            return "Portal";
          case REACT_CONTEXT_TYPE:
            return type.displayName || "Context";
          case REACT_CONSUMER_TYPE:
            return (type._context.displayName || "Context") + ".Consumer";
          case REACT_FORWARD_REF_TYPE:
            var innerType = type.render;
            type = type.displayName;
            type || (type = innerType.displayName || innerType.name || "", type = type !== "" ? "ForwardRef(" + type + ")" : "ForwardRef");
            return type;
          case REACT_MEMO_TYPE:
            return innerType = type.displayName || null, innerType !== null ? innerType : getComponentNameFromType(type.type) || "Memo";
          case REACT_LAZY_TYPE:
            innerType = type._payload;
            type = type._init;
            try {
              return getComponentNameFromType(type(innerType));
            } catch (x) {}
        }
      return null;
    }
    function getTaskName(type) {
      if (type === REACT_FRAGMENT_TYPE)
        return "<>";
      if (typeof type === "object" && type !== null && type.$$typeof === REACT_LAZY_TYPE)
        return "<...>";
      try {
        var name = getComponentNameFromType(type);
        return name ? "<" + name + ">" : "<...>";
      } catch (x) {
        return "<...>";
      }
    }
    function getOwner() {
      var dispatcher = ReactSharedInternals.A;
      return dispatcher === null ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
      return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
      if (hasOwnProperty.call(config, "key")) {
        var getter = Object.getOwnPropertyDescriptor(config, "key").get;
        if (getter && getter.isReactWarning)
          return false;
      }
      return config.key !== undefined;
    }
    function defineKeyPropWarningGetter(props, displayName) {
      function warnAboutAccessingKey() {
        specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
      }
      warnAboutAccessingKey.isReactWarning = true;
      Object.defineProperty(props, "key", {
        get: warnAboutAccessingKey,
        configurable: true
      });
    }
    function elementRefGetterWithDeprecationWarning() {
      var componentName = getComponentNameFromType(this.type);
      didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
      componentName = this.props.ref;
      return componentName !== undefined ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
      var refProp = props.ref;
      type = {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        props,
        _owner: owner
      };
      (refProp !== undefined ? refProp : null) !== null ? Object.defineProperty(type, "ref", {
        enumerable: false,
        get: elementRefGetterWithDeprecationWarning
      }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
      type._store = {};
      Object.defineProperty(type._store, "validated", {
        configurable: false,
        enumerable: false,
        writable: true,
        value: 0
      });
      Object.defineProperty(type, "_debugInfo", {
        configurable: false,
        enumerable: false,
        writable: true,
        value: null
      });
      Object.defineProperty(type, "_debugStack", {
        configurable: false,
        enumerable: false,
        writable: true,
        value: debugStack
      });
      Object.defineProperty(type, "_debugTask", {
        configurable: false,
        enumerable: false,
        writable: true,
        value: debugTask
      });
      Object.freeze && (Object.freeze(type.props), Object.freeze(type));
      return type;
    }
    function cloneAndReplaceKey(oldElement, newKey) {
      newKey = ReactElement(oldElement.type, newKey, oldElement.props, oldElement._owner, oldElement._debugStack, oldElement._debugTask);
      oldElement._store && (newKey._store.validated = oldElement._store.validated);
      return newKey;
    }
    function validateChildKeys(node) {
      isValidElement(node) ? node._store && (node._store.validated = 1) : typeof node === "object" && node !== null && node.$$typeof === REACT_LAZY_TYPE && (node._payload.status === "fulfilled" ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
      return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function escape(key) {
      var escaperLookup = { "=": "=0", ":": "=2" };
      return "$" + key.replace(/[=:]/g, function(match) {
        return escaperLookup[match];
      });
    }
    function getElementKey(element, index) {
      return typeof element === "object" && element !== null && element.key != null ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
    }
    function resolveThenable(thenable) {
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
        default:
          switch (typeof thenable.status === "string" ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
            thenable.status === "pending" && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
          }, function(error) {
            thenable.status === "pending" && (thenable.status = "rejected", thenable.reason = error);
          })), thenable.status) {
            case "fulfilled":
              return thenable.value;
            case "rejected":
              throw thenable.reason;
          }
      }
      throw thenable;
    }
    function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
      var type = typeof children;
      if (type === "undefined" || type === "boolean")
        children = null;
      var invokeCallback = false;
      if (children === null)
        invokeCallback = true;
      else
        switch (type) {
          case "bigint":
          case "string":
          case "number":
            invokeCallback = true;
            break;
          case "object":
            switch (children.$$typeof) {
              case REACT_ELEMENT_TYPE:
              case REACT_PORTAL_TYPE:
                invokeCallback = true;
                break;
              case REACT_LAZY_TYPE:
                return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
            }
        }
      if (invokeCallback) {
        invokeCallback = children;
        callback = callback(invokeCallback);
        var childKey = nameSoFar === "" ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
        isArrayImpl(callback) ? (escapedPrefix = "", childKey != null && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
          return c;
        })) : callback != null && (isValidElement(callback) && (callback.key != null && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(callback, escapedPrefix + (callback.key == null || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + childKey), nameSoFar !== "" && invokeCallback != null && isValidElement(invokeCallback) && invokeCallback.key == null && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
        return 1;
      }
      invokeCallback = 0;
      childKey = nameSoFar === "" ? "." : nameSoFar + ":";
      if (isArrayImpl(children))
        for (var i = 0;i < children.length; i++)
          nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
      else if (i = getIteratorFn(children), typeof i === "function")
        for (i === children.entries && (didWarnAboutMaps || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), didWarnAboutMaps = true), children = i.call(children), i = 0;!(nameSoFar = children.next()).done; )
          nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
      else if (type === "object") {
        if (typeof children.then === "function")
          return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
        array = String(children);
        throw Error("Objects are not valid as a React child (found: " + (array === "[object Object]" ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
      }
      return invokeCallback;
    }
    function mapChildren(children, func, context) {
      if (children == null)
        return children;
      var result = [], count = 0;
      mapIntoArray(children, result, "", "", function(child) {
        return func.call(context, child, count++);
      });
      return result;
    }
    function lazyInitializer(payload) {
      if (payload._status === -1) {
        var ioInfo = payload._ioInfo;
        ioInfo != null && (ioInfo.start = ioInfo.end = performance.now());
        ioInfo = payload._result;
        var thenable = ioInfo();
        thenable.then(function(moduleObject) {
          if (payload._status === 0 || payload._status === -1) {
            payload._status = 1;
            payload._result = moduleObject;
            var _ioInfo = payload._ioInfo;
            _ioInfo != null && (_ioInfo.end = performance.now());
            thenable.status === undefined && (thenable.status = "fulfilled", thenable.value = moduleObject);
          }
        }, function(error) {
          if (payload._status === 0 || payload._status === -1) {
            payload._status = 2;
            payload._result = error;
            var _ioInfo2 = payload._ioInfo;
            _ioInfo2 != null && (_ioInfo2.end = performance.now());
            thenable.status === undefined && (thenable.status = "rejected", thenable.reason = error);
          }
        });
        ioInfo = payload._ioInfo;
        if (ioInfo != null) {
          ioInfo.value = thenable;
          var displayName = thenable.displayName;
          typeof displayName === "string" && (ioInfo.name = displayName);
        }
        payload._status === -1 && (payload._status = 0, payload._result = thenable);
      }
      if (payload._status === 1)
        return ioInfo = payload._result, ioInfo === undefined && console.error(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))

Did you accidentally put curly braces around the import?`, ioInfo), "default" in ioInfo || console.error(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))`, ioInfo), ioInfo.default;
      throw payload._result;
    }
    function resolveDispatcher() {
      var dispatcher = ReactSharedInternals.H;
      dispatcher === null && console.error(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.`);
      return dispatcher;
    }
    function releaseAsyncTransition() {
      ReactSharedInternals.asyncTransitions--;
    }
    function enqueueTask(task) {
      if (enqueueTaskImpl === null)
        try {
          var requireString = ("require" + Math.random()).slice(0, 7);
          enqueueTaskImpl = (module && module[requireString]).call(module, "timers").setImmediate;
        } catch (_err) {
          enqueueTaskImpl = function(callback) {
            didWarnAboutMessageChannel === false && (didWarnAboutMessageChannel = true, typeof MessageChannel === "undefined" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
            var channel = new MessageChannel;
            channel.port1.onmessage = callback;
            channel.port2.postMessage(undefined);
          };
        }
      return enqueueTaskImpl(task);
    }
    function aggregateErrors(errors) {
      return 1 < errors.length && typeof AggregateError === "function" ? new AggregateError(errors) : errors[0];
    }
    function popActScope(prevActQueue, prevActScopeDepth) {
      prevActScopeDepth !== actScopeDepth - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. ");
      actScopeDepth = prevActScopeDepth;
    }
    function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
      var queue = ReactSharedInternals.actQueue;
      if (queue !== null)
        if (queue.length !== 0)
          try {
            flushActQueue(queue);
            enqueueTask(function() {
              return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
            });
            return;
          } catch (error) {
            ReactSharedInternals.thrownErrors.push(error);
          }
        else
          ReactSharedInternals.actQueue = null;
      0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
    }
    function flushActQueue(queue) {
      if (!isFlushing) {
        isFlushing = true;
        var i = 0;
        try {
          for (;i < queue.length; i++) {
            var callback = queue[i];
            do {
              ReactSharedInternals.didUsePromise = false;
              var continuation = callback(false);
              if (continuation !== null) {
                if (ReactSharedInternals.didUsePromise) {
                  queue[i] = callback;
                  queue.splice(0, i);
                  return;
                }
                callback = continuation;
              } else
                break;
            } while (1);
          }
          queue.length = 0;
        } catch (error) {
          queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
        } finally {
          isFlushing = false;
        }
      }
    }
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
      isMounted: function() {
        return false;
      },
      enqueueForceUpdate: function(publicInstance) {
        warnNoop(publicInstance, "forceUpdate");
      },
      enqueueReplaceState: function(publicInstance) {
        warnNoop(publicInstance, "replaceState");
      },
      enqueueSetState: function(publicInstance) {
        warnNoop(publicInstance, "setState");
      }
    }, assign = Object.assign, emptyObject = {};
    Object.freeze(emptyObject);
    Component.prototype.isReactComponent = {};
    Component.prototype.setState = function(partialState, callback) {
      if (typeof partialState !== "object" && typeof partialState !== "function" && partialState != null)
        throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
      this.updater.enqueueSetState(this, partialState, callback, "setState");
    };
    Component.prototype.forceUpdate = function(callback) {
      this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
    };
    var deprecatedAPIs = {
      isMounted: [
        "isMounted",
        "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
      ],
      replaceState: [
        "replaceState",
        "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
      ]
    };
    for (fnName in deprecatedAPIs)
      deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
    ComponentDummy.prototype = Component.prototype;
    deprecatedAPIs = PureComponent.prototype = new ComponentDummy;
    deprecatedAPIs.constructor = PureComponent;
    assign(deprecatedAPIs, Component.prototype);
    deprecatedAPIs.isPureReactComponent = true;
    var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = {
      H: null,
      A: null,
      T: null,
      S: null,
      actQueue: null,
      asyncTransitions: 0,
      isBatchingLegacy: false,
      didScheduleLegacyUpdate: false,
      didUsePromise: false,
      thrownErrors: [],
      getCurrentStack: null,
      recentlyCreatedOwnerStacks: 0
    }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
      return null;
    };
    deprecatedAPIs = {
      react_stack_bottom_frame: function(callStackForError) {
        return callStackForError();
      }
    };
    var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(deprecatedAPIs, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = typeof reportError === "function" ? reportError : function(error) {
      if (typeof window === "object" && typeof window.ErrorEvent === "function") {
        var event = new window.ErrorEvent("error", {
          bubbles: true,
          cancelable: true,
          message: typeof error === "object" && error !== null && typeof error.message === "string" ? String(error.message) : String(error),
          error
        });
        if (!window.dispatchEvent(event))
          return;
      } else if (typeof process === "object" && typeof process.emit === "function") {
        process.emit("uncaughtException", error);
        return;
      }
      console.error(error);
    }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = typeof queueMicrotask === "function" ? function(callback) {
      queueMicrotask(function() {
        return queueMicrotask(callback);
      });
    } : enqueueTask;
    deprecatedAPIs = Object.freeze({
      __proto__: null,
      c: function(size) {
        return resolveDispatcher().useMemoCache(size);
      }
    });
    var fnName = {
      map: mapChildren,
      forEach: function(children, forEachFunc, forEachContext) {
        mapChildren(children, function() {
          forEachFunc.apply(this, arguments);
        }, forEachContext);
      },
      count: function(children) {
        var n = 0;
        mapChildren(children, function() {
          n++;
        });
        return n;
      },
      toArray: function(children) {
        return mapChildren(children, function(child) {
          return child;
        }) || [];
      },
      only: function(children) {
        if (!isValidElement(children))
          throw Error("React.Children.only expected to receive a single React element child.");
        return children;
      }
    };
    exports.Activity = REACT_ACTIVITY_TYPE;
    exports.Children = fnName;
    exports.Component = Component;
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.Profiler = REACT_PROFILER_TYPE;
    exports.PureComponent = PureComponent;
    exports.StrictMode = REACT_STRICT_MODE_TYPE;
    exports.Suspense = REACT_SUSPENSE_TYPE;
    exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
    exports.__COMPILER_RUNTIME = deprecatedAPIs;
    exports.act = function(callback) {
      var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
      actScopeDepth++;
      var queue = ReactSharedInternals.actQueue = prevActQueue !== null ? prevActQueue : [], didAwaitActCall = false;
      try {
        var result = callback();
      } catch (error) {
        ReactSharedInternals.thrownErrors.push(error);
      }
      if (0 < ReactSharedInternals.thrownErrors.length)
        throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
      if (result !== null && typeof result === "object" && typeof result.then === "function") {
        var thenable = result;
        queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
        });
        return {
          then: function(resolve, reject) {
            didAwaitActCall = true;
            thenable.then(function(returnValue) {
              popActScope(prevActQueue, prevActScopeDepth);
              if (prevActScopeDepth === 0) {
                try {
                  flushActQueue(queue), enqueueTask(function() {
                    return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                  });
                } catch (error$0) {
                  ReactSharedInternals.thrownErrors.push(error$0);
                }
                if (0 < ReactSharedInternals.thrownErrors.length) {
                  var _thrownError = aggregateErrors(ReactSharedInternals.thrownErrors);
                  ReactSharedInternals.thrownErrors.length = 0;
                  reject(_thrownError);
                }
              } else
                resolve(returnValue);
            }, function(error) {
              popActScope(prevActQueue, prevActScopeDepth);
              0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
            });
          }
        };
      }
      var returnValue$jscomp$0 = result;
      popActScope(prevActQueue, prevActScopeDepth);
      prevActScopeDepth === 0 && (flushActQueue(queue), queue.length !== 0 && queueSeveralMicrotasks(function() {
        didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
      }), ReactSharedInternals.actQueue = null);
      if (0 < ReactSharedInternals.thrownErrors.length)
        throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
      return {
        then: function(resolve, reject) {
          didAwaitActCall = true;
          prevActScopeDepth === 0 ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
            return recursivelyFlushAsyncActWork(returnValue$jscomp$0, resolve, reject);
          })) : resolve(returnValue$jscomp$0);
        }
      };
    };
    exports.cache = function(fn) {
      return function() {
        return fn.apply(null, arguments);
      };
    };
    exports.cacheSignal = function() {
      return null;
    };
    exports.captureOwnerStack = function() {
      var getCurrentStack = ReactSharedInternals.getCurrentStack;
      return getCurrentStack === null ? null : getCurrentStack();
    };
    exports.cloneElement = function(element, config, children) {
      if (element === null || element === undefined)
        throw Error("The argument must be a React element, but you passed " + element + ".");
      var props = assign({}, element.props), key = element.key, owner = element._owner;
      if (config != null) {
        var JSCompiler_inline_result;
        a: {
          if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(config, "ref").get) && JSCompiler_inline_result.isReactWarning) {
            JSCompiler_inline_result = false;
            break a;
          }
          JSCompiler_inline_result = config.ref !== undefined;
        }
        JSCompiler_inline_result && (owner = getOwner());
        hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
        for (propName in config)
          !hasOwnProperty.call(config, propName) || propName === "key" || propName === "__self" || propName === "__source" || propName === "ref" && config.ref === undefined || (props[propName] = config[propName]);
      }
      var propName = arguments.length - 2;
      if (propName === 1)
        props.children = children;
      else if (1 < propName) {
        JSCompiler_inline_result = Array(propName);
        for (var i = 0;i < propName; i++)
          JSCompiler_inline_result[i] = arguments[i + 2];
        props.children = JSCompiler_inline_result;
      }
      props = ReactElement(element.type, key, props, owner, element._debugStack, element._debugTask);
      for (key = 2;key < arguments.length; key++)
        validateChildKeys(arguments[key]);
      return props;
    };
    exports.createContext = function(defaultValue) {
      defaultValue = {
        $$typeof: REACT_CONTEXT_TYPE,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        Provider: null,
        Consumer: null
      };
      defaultValue.Provider = defaultValue;
      defaultValue.Consumer = {
        $$typeof: REACT_CONSUMER_TYPE,
        _context: defaultValue
      };
      defaultValue._currentRenderer = null;
      defaultValue._currentRenderer2 = null;
      return defaultValue;
    };
    exports.createElement = function(type, config, children) {
      for (var i = 2;i < arguments.length; i++)
        validateChildKeys(arguments[i]);
      i = {};
      var key = null;
      if (config != null)
        for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)
          hasOwnProperty.call(config, propName) && propName !== "key" && propName !== "__self" && propName !== "__source" && (i[propName] = config[propName]);
      var childrenLength = arguments.length - 2;
      if (childrenLength === 1)
        i.children = children;
      else if (1 < childrenLength) {
        for (var childArray = Array(childrenLength), _i = 0;_i < childrenLength; _i++)
          childArray[_i] = arguments[_i + 2];
        Object.freeze && Object.freeze(childArray);
        i.children = childArray;
      }
      if (type && type.defaultProps)
        for (propName in childrenLength = type.defaultProps, childrenLength)
          i[propName] === undefined && (i[propName] = childrenLength[propName]);
      key && defineKeyPropWarningGetter(i, typeof type === "function" ? type.displayName || type.name || "Unknown" : type);
      var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
      return ReactElement(type, key, i, getOwner(), propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack, propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
    exports.createRef = function() {
      var refObject = { current: null };
      Object.seal(refObject);
      return refObject;
    };
    exports.forwardRef = function(render) {
      render != null && render.$$typeof === REACT_MEMO_TYPE ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof render !== "function" ? console.error("forwardRef requires a render function but was given %s.", render === null ? "null" : typeof render) : render.length !== 0 && render.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", render.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.");
      render != null && render.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
      var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
      Object.defineProperty(elementType, "displayName", {
        enumerable: false,
        configurable: true,
        get: function() {
          return ownName;
        },
        set: function(name) {
          ownName = name;
          render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
        }
      });
      return elementType;
    };
    exports.isValidElement = isValidElement;
    exports.lazy = function(ctor) {
      ctor = { _status: -1, _result: ctor };
      var lazyType = {
        $$typeof: REACT_LAZY_TYPE,
        _payload: ctor,
        _init: lazyInitializer
      }, ioInfo = {
        name: "lazy",
        start: -1,
        end: -1,
        value: null,
        owner: null,
        debugStack: Error("react-stack-top-frame"),
        debugTask: console.createTask ? console.createTask("lazy()") : null
      };
      ctor._ioInfo = ioInfo;
      lazyType._debugInfo = [{ awaited: ioInfo }];
      return lazyType;
    };
    exports.memo = function(type, compare) {
      type == null && console.error("memo: The first argument must be a component. Instead received: %s", type === null ? "null" : typeof type);
      compare = {
        $$typeof: REACT_MEMO_TYPE,
        type,
        compare: compare === undefined ? null : compare
      };
      var ownName;
      Object.defineProperty(compare, "displayName", {
        enumerable: false,
        configurable: true,
        get: function() {
          return ownName;
        },
        set: function(name) {
          ownName = name;
          type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
        }
      });
      return compare;
    };
    exports.startTransition = function(scope) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      currentTransition._updatedFibers = new Set;
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
        onStartTransitionFinish !== null && onStartTransitionFinish(currentTransition, returnValue);
        typeof returnValue === "object" && returnValue !== null && typeof returnValue.then === "function" && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop, reportGlobalError));
      } catch (error) {
        reportGlobalError(error);
      } finally {
        prevTransition === null && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), prevTransition !== null && currentTransition.types !== null && (prevTransition.types !== null && prevTransition.types !== currentTransition.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
      }
    };
    exports.unstable_useCacheRefresh = function() {
      return resolveDispatcher().useCacheRefresh();
    };
    exports.use = function(usable) {
      return resolveDispatcher().use(usable);
    };
    exports.useActionState = function(action, initialState, permalink) {
      return resolveDispatcher().useActionState(action, initialState, permalink);
    };
    exports.useCallback = function(callback, deps) {
      return resolveDispatcher().useCallback(callback, deps);
    };
    exports.useContext = function(Context) {
      var dispatcher = resolveDispatcher();
      Context.$$typeof === REACT_CONSUMER_TYPE && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?");
      return dispatcher.useContext(Context);
    };
    exports.useDebugValue = function(value, formatterFn) {
      return resolveDispatcher().useDebugValue(value, formatterFn);
    };
    exports.useDeferredValue = function(value, initialValue) {
      return resolveDispatcher().useDeferredValue(value, initialValue);
    };
    exports.useEffect = function(create, deps) {
      create == null && console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?");
      return resolveDispatcher().useEffect(create, deps);
    };
    exports.useEffectEvent = function(callback) {
      return resolveDispatcher().useEffectEvent(callback);
    };
    exports.useId = function() {
      return resolveDispatcher().useId();
    };
    exports.useImperativeHandle = function(ref, create, deps) {
      return resolveDispatcher().useImperativeHandle(ref, create, deps);
    };
    exports.useInsertionEffect = function(create, deps) {
      create == null && console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?");
      return resolveDispatcher().useInsertionEffect(create, deps);
    };
    exports.useLayoutEffect = function(create, deps) {
      create == null && console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?");
      return resolveDispatcher().useLayoutEffect(create, deps);
    };
    exports.useMemo = function(create, deps) {
      return resolveDispatcher().useMemo(create, deps);
    };
    exports.useOptimistic = function(passthrough, reducer) {
      return resolveDispatcher().useOptimistic(passthrough, reducer);
    };
    exports.useReducer = function(reducer, initialArg, init) {
      return resolveDispatcher().useReducer(reducer, initialArg, init);
    };
    exports.useRef = function(initialValue) {
      return resolveDispatcher().useRef(initialValue);
    };
    exports.useState = function(initialState) {
      return resolveDispatcher().useState(initialState);
    };
    exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
      return resolveDispatcher().useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    };
    exports.useTransition = function() {
      return resolveDispatcher().useTransition();
    };
    exports.version = "19.2.3";
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })();
});

// node_modules/react/index.js
var require_react = __commonJS((exports, module) => {
  var react_development = __toESM(require_react_development());
  if (false) {} else {
    module.exports = react_development;
  }
});

// src/lib/editor/constants.ts
var TEXT_FONTS = [
  { id: "display", name: "Orbitron (Futuristik)", stack: '"Orbitron", "Arial Black", sans-serif' },
  { id: "impact", name: "Anton (Poster)", stack: '"Anton", Impact, sans-serif' },
  { id: "condensed", name: "Bebas Neue (Trailer)", stack: '"Bebas Neue", "Arial Narrow", sans-serif' },
  { id: "sans", name: "Rajdhani (Tech)", stack: '"Rajdhani", "Segoe UI", sans-serif' },
  { id: "serif", name: "Playfair (Elegan)", stack: '"Playfair Display", Georgia, serif' },
  { id: "montserrat", name: "Montserrat (Iklan Modern)", stack: '"Montserrat", Arial, sans-serif' },
  { id: "oswald", name: "Oswald (Film & Trailer)", stack: '"Oswald", "Arial Narrow", sans-serif' },
  { id: "archivo", name: "Archivo Black (Poster Tebal)", stack: '"Archivo Black", "Arial Black", sans-serif' },
  { id: "barlow", name: "Barlow Condensed (Subtitle Film)", stack: '"Barlow Condensed", "Arial Narrow", sans-serif' },
  { id: "cinzel", name: "Cinzel (Epic Sinematik)", stack: '"Cinzel", Georgia, serif' },
  { id: "teko", name: "Teko (Judul Sport)", stack: '"Teko", "Arial Narrow", sans-serif' },
  { id: "russo", name: "Russo One (Aksi)", stack: '"Russo One", "Arial Black", sans-serif' },
  { id: "michroma", name: "Michroma (Sci-Fi)", stack: '"Michroma", Arial, sans-serif' },
  { id: "italiana", name: "Italiana (Elegan Klasik)", stack: '"Italiana", Georgia, serif' },
  { id: "righteous", name: "Righteous (Poster Retro)", stack: '"Righteous", Arial, sans-serif' },
  { id: "alfaslab", name: "Alfa Slab One (Slab Tebal)", stack: '"Alfa Slab One", Georgia, serif' }
];
function fontStack(id) {
  return TEXT_FONTS.find((f) => f.id === id)?.stack ?? TEXT_FONTS[3].stack;
}
var COVER_PALETTES = [
  { id: "cyber", name: "Cyber Neon", fg: "#eafcff", accent: "#22d3ee", bg1: "#0b0f2a", bg2: "#310e5f" },
  { id: "sunset", name: "Sunset Fire", fg: "#fff7ec", accent: "#fb923c", bg1: "#3b0d20", bg2: "#7c2d12" },
  { id: "gold", name: "Gold Luxury", fg: "#fffbe9", accent: "#f5c542", bg1: "#141005", bg2: "#3d2e05" },
  { id: "ice", name: "Ice Cool", fg: "#f2fbff", accent: "#7dd3fc", bg1: "#071c26", bg2: "#0b3a4a" },
  { id: "toxic", name: "Toxic Green", fg: "#f2fff2", accent: "#4ade80", bg1: "#05140a", bg2: "#0f3d22" },
  { id: "royal", name: "Royal Purple", fg: "#faf5ff", accent: "#c084fc", bg1: "#160a2b", bg2: "#3b1263" },
  { id: "blood", name: "Blood Red", fg: "#fff2f2", accent: "#f87171", bg1: "#1b0505", bg2: "#450a0a" },
  { id: "mono", name: "Monochrome", fg: "#fafafa", accent: "#ffffff", bg1: "#09090b", bg2: "#27272a" },
  { id: "candy", name: "Candy Pop", fg: "#fffafc", accent: "#f472b6", bg1: "#2b0a1e", bg2: "#701a45" },
  { id: "ocean", name: "Ocean Deep", fg: "#effffa", accent: "#2dd4bf", bg1: "#04161c", bg2: "#134e4a" }
];
var COVER_LAYOUTS = [
  { id: "impact", name: "Impact Center", popular: true },
  { id: "lower", name: "Lower Third", popular: true },
  { id: "banner", name: "Top Banner" },
  { id: "side", name: "Gradient Side", popular: true },
  { id: "boxed", name: "Boxed Title" },
  { id: "neon", name: "Neon Glow", popular: true },
  { id: "bars", name: "Cinematic Bars" },
  { id: "sticker", name: "Sticker Badge" },
  { id: "outline", name: "Outline Raksasa", popular: true },
  { id: "band", name: "Diagonal Band" }
];
var COVER_TEMPLATES = COVER_LAYOUTS.flatMap((l) => COVER_PALETTES.map((p) => ({
  id: `${l.id}--${p.id}`,
  name: `${l.name} · ${p.name}`,
  layout: l.id,
  palette: p,
  popular: !!l.popular
})));
var MUSIC_LIBRARY = [
  { id: "epic-trailer", name: "Epic Trailer Impact", genre: "Trailer", bpm: 90, bars: 16, root: 45, scale: "minor", chords: [0, 5, 2, 6], drums: "epic", bass: "sub", pad: true, arp: "none", color: "#f87171" },
  { id: "cinematic-rise", name: "Cinematic Rise", genre: "Sinematik", bpm: 80, bars: 16, root: 43, scale: "minor", chords: [0, 3, 5, 4], drums: "march", bass: "sub", pad: true, arp: "none", color: "#c084fc" },
  { id: "blockbuster-action", name: "Blockbuster Action", genre: "Aksi", bpm: 140, bars: 16, root: 41, scale: "phrygian", chords: [0, 0, 5, 6], drums: "drive", bass: "saw", pad: false, arp: "up", color: "#fb923c" },
  { id: "suspense", name: "Suspense Tension", genre: "Misteri", bpm: 100, bars: 16, root: 40, scale: "minor", chords: [0, 0, 1, 0], drums: "tick", bass: "sub", pad: true, arp: "none", color: "#94a3b8" },
  { id: "corporate", name: "Corporate Uplift", genre: "Korporat", bpm: 120, bars: 16, root: 48, scale: "major", chords: [0, 4, 5, 3], drums: "four", bass: "pluck", pad: true, arp: "up", color: "#4ade80" },
  { id: "happy-vlog", name: "Happy Vlog", genre: "Vlog", bpm: 126, bars: 16, root: 50, scale: "major", chords: [0, 3, 4, 4], drums: "four", bass: "pluck", pad: false, arp: "updown", color: "#facc15" },
  { id: "lofi", name: "Chill Lo-Fi", genre: "Lo-Fi", bpm: 78, bars: 16, root: 45, scale: "dorian", chords: [0, 3, 4, 2], drums: "lofi", bass: "sub", pad: true, arp: "none", seventh: true, color: "#a3e635" },
  { id: "synthwave", name: "Neon Synthwave", genre: "Synthwave", bpm: 110, bars: 16, root: 45, scale: "minor", chords: [0, 5, 3, 4], drums: "four", bass: "saw", pad: true, arp: "up", color: "#22d3ee" },
  { id: "edm", name: "EDM Drop", genre: "EDM", bpm: 128, bars: 16, root: 43, scale: "minor", chords: [0, 5, 6, 4], drums: "four", bass: "saw", pad: true, arp: "up", color: "#e879f9" },
  { id: "trap", name: "Trap Banger", genre: "Trap", bpm: 140, bars: 16, root: 42, scale: "phrygian", chords: [0, 0, 5, 1], drums: "trap", bass: "sub", pad: true, arp: "none", color: "#f472b6" },
  { id: "hiphop", name: "Hip-Hop Boom", genre: "Hip-Hop", bpm: 92, bars: 16, root: 45, scale: "minor", chords: [0, 0, 5, 3], drums: "boombap", bass: "pluck", pad: false, arp: "none", color: "#fdba74" },
  { id: "rock", name: "Rock Energy", genre: "Rock", bpm: 150, bars: 16, root: 40, scale: "phrygian", chords: [0, 0, 3, 5], drums: "rock", bass: "saw", pad: false, arp: "none", color: "#ef4444" },
  { id: "funk", name: "Funk Groove", genre: "Funk", bpm: 112, bars: 16, root: 46, scale: "dorian", chords: [0, 0, 3, 4], drums: "breaks", bass: "pluck", pad: false, arp: "updown", seventh: true, color: "#fde047" },
  { id: "tropical", name: "Tropical Summer", genre: "Tropical", bpm: 105, bars: 16, root: 52, scale: "major", chords: [0, 4, 5, 3], drums: "four", bass: "pluck", pad: true, arp: "up", color: "#2dd4bf" },
  { id: "ambient", name: "Ambient Dream", genre: "Ambient", bpm: 70, bars: 16, root: 48, scale: "major", chords: [0, 3, 5, 2], drums: "none", bass: "sub", pad: true, arp: "down", color: "#7dd3fc" },
  { id: "piano-drama", name: "Dramatic Piano", genre: "Drama", bpm: 84, bars: 16, root: 41, scale: "minor", chords: [0, 5, 2, 6], drums: "none", bass: "sub", pad: false, arp: "none", color: "#d8b4fe" },
  { id: "orchestral", name: "Epic Orchestral", genre: "Orkestra", bpm: 96, bars: 16, root: 43, scale: "minor", chords: [0, 3, 5, 6], drums: "march", bass: "sub", pad: true, arp: "none", color: "#fca5a5" },
  { id: "tech", name: "Tech Runner", genre: "Tekno", bpm: 132, bars: 16, root: 40, scale: "minor", chords: [0, 0, 6, 6], drums: "four", bass: "saw", pad: false, arp: "up", color: "#67e8f9" },
  { id: "sport", name: "Sport Hype", genre: "Olahraga", bpm: 128, bars: 16, root: 45, scale: "minor", chords: [0, 5, 0, 6], drums: "drive", bass: "saw", pad: true, arp: "updown", color: "#fbbf24" },
  { id: "dark-mystery", name: "Mystery Dark", genre: "Misteri", bpm: 95, bars: 16, root: 38, scale: "phrygian", chords: [0, 1, 0, 4], drums: "tick", bass: "sub", pad: true, arp: "down", color: "#9ca3af" }
];
function partLabel(style, index, total, withTotal) {
  switch (style) {
    case "Episode":
      return withTotal ? `Episode ${index}/${total}` : `Episode ${index}`;
    case "Bagian":
      return withTotal ? `Bagian ${index}/${total}` : `Bagian ${index}`;
    case "Eps":
      return `EPS ${String(index).padStart(2, "0")}`;
    case "EP":
      return `EP ${String(index).padStart(2, "0")}`;
    default:
      return withTotal ? `Part ${index}/${total}` : `Part ${index}`;
  }
}
function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

// src/lib/editor/music.ts
var SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10]
};
function midiToFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}
function degreeToMidi(root, scale, deg) {
  const oct = Math.floor(deg / scale.length);
  const idx = (deg % scale.length + scale.length) % scale.length;
  return root + scale[idx] + oct * 12;
}
function noiseBuffer(ctx, dur = 1) {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0;i < d.length; i++)
    d[i] = Math.random() * 2 - 1;
  return buf;
}
function kick(ctx, t, out, gain = 1) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(160, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.11);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.32);
}
function boom(ctx, t, out, gain = 0.9) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(80, t);
  o.frequency.exponentialRampToValueAtTime(30, t + 0.8);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 1.5);
  const n = ctx.createBufferSource();
  n.buffer = noiseBuffer(ctx, 0.5);
  const ng = ctx.createGain();
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 900;
  ng.gain.setValueAtTime(gain * 0.5, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  n.connect(f).connect(ng).connect(out);
  n.start(t);
}
function snare(ctx, t, out, gain = 0.5) {
  const n = ctx.createBufferSource();
  n.buffer = noiseBuffer(ctx, 0.25);
  const f = ctx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 1700;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  n.connect(f).connect(g).connect(out);
  n.start(t);
  const o = ctx.createOscillator();
  const og = ctx.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(190, t);
  og.gain.setValueAtTime(gain * 0.6, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  o.connect(og).connect(out);
  o.start(t);
  o.stop(t + 0.12);
}
function clap(ctx, t, out, gain = 0.4) {
  for (let i = 0;i < 3; i++) {
    const n = ctx.createBufferSource();
    n.buffer = noiseBuffer(ctx, 0.15);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1400;
    const g = ctx.createGain();
    const tt = t + i * 0.012;
    g.gain.setValueAtTime(gain * (1 - i * 0.25), tt);
    g.gain.exponentialRampToValueAtTime(0.001, tt + 0.12);
    n.connect(f).connect(g).connect(out);
    n.start(tt);
  }
}
function hat(ctx, t, out, gain = 0.18, open = false) {
  const n = ctx.createBufferSource();
  n.buffer = noiseBuffer(ctx, open ? 0.3 : 0.06);
  const f = ctx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 8200;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.25 : 0.045));
  n.connect(f).connect(g).connect(out);
  n.start(t);
}
function tom(ctx, t, out, freq, gain = 0.5) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.25);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.32);
}
function crash(ctx, t, out, gain = 0.3) {
  const n = ctx.createBufferSource();
  n.buffer = noiseBuffer(ctx, 1.2);
  const f = ctx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 5200;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
  n.connect(f).connect(g).connect(out);
  n.start(t);
}
function riser(ctx, t, dur, out, gain = 0.25) {
  const n = ctx.createBufferSource();
  n.buffer = noiseBuffer(ctx, dur);
  n.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(300, t);
  f.frequency.exponentialRampToValueAtTime(6000, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.9);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  n.connect(f).connect(g).connect(out);
  n.start(t);
  n.stop(t + dur);
}
function bassNote(ctx, t, dur, freq, out, style, gain = 0.5) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const f = ctx.createBiquadFilter();
  if (style === "sub") {
    o.type = "sine";
    g.gain.setValueAtTime(gain, t);
    g.gain.setValueAtTime(gain, t + dur * 0.7);
    g.gain.linearRampToValueAtTime(0.001, t + dur);
  } else if (style === "saw") {
    o.type = "sawtooth";
    f.type = "lowpass";
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(220, t + dur * 0.9);
    g.gain.setValueAtTime(gain * 0.55, t);
    g.gain.setValueAtTime(gain * 0.5, t + dur * 0.8);
    g.gain.linearRampToValueAtTime(0.001, t + dur);
  } else {
    o.type = "triangle";
    f.type = "lowpass";
    f.frequency.value = 1200;
    g.gain.setValueAtTime(gain * 0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + Math.min(dur, 0.35));
  }
  o.frequency.value = freq;
  o.connect(f).connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function pluck(ctx, t, freq, out, gain = 0.22, pan = 0) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  let node = g;
  if (pan !== 0 && ctx.createStereoPanner) {
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    g.connect(p);
    node = p;
  }
  o.connect(g);
  node.connect(out);
  o.start(t);
  o.stop(t + 0.3);
}
function padChord(ctx, t, dur, midis, out, gain = 0.09) {
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 1500;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(gain, t + dur * 0.3);
  g.gain.setValueAtTime(gain, t + dur * 0.75);
  g.gain.linearRampToValueAtTime(0.001, t + dur);
  f.connect(g).connect(out);
  for (const m of midis) {
    for (const det of [-6, 5]) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = midiToFreq(m);
      o.detune.value = det;
      o.connect(f);
      o.start(t);
      o.stop(t + dur + 0.1);
    }
  }
}
function stab(ctx, t, midis, out, gain = 0.16) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 2400;
  f.connect(g).connect(out);
  for (const m of midis) {
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.value = midiToFreq(m);
    o.connect(f);
    o.start(t);
    o.stop(t + 0.25);
  }
}
function drumPattern(ctx, def, bar, barT, beat, out, intensity) {
  const S = 4;
  const st = (i) => barT + i * beat / S;
  const d = def.drums;
  const v = intensity;
  if (d === "four") {
    for (let i = 0;i < 16; i += 4)
      kick(ctx, st(i), out, 0.85 * v);
    for (let i = 2;i < 16; i += 4)
      hat(ctx, st(i), out, 0.16 * v);
    clap(ctx, st(4), out, 0.32 * v);
    clap(ctx, st(12), out, 0.32 * v);
    if (bar % 4 === 3)
      hat(ctx, st(14), out, 0.16 * v, true);
  } else if (d === "epic") {
    kick(ctx, st(0), out, v);
    kick(ctx, st(8), out, 0.9 * v);
    if (bar % 2 === 1)
      tom(ctx, st(11), out, 110, 0.5 * v);
    if (bar % 4 === 0)
      crash(ctx, st(0), out, 0.28 * v);
    if (bar % 4 === 3) {
      for (let i = 8;i < 16; i++)
        snare(ctx, st(i), out, 0.12 * v + (i - 8) * 0.03 * v);
      boom(ctx, barT + beat * 4 - 0.05, out, 0.8 * v);
    }
    if (bar === 0)
      boom(ctx, st(0), out, v);
  } else if (d === "march") {
    if (bar % 2 === 0) {
      tom(ctx, st(0), out, 96, 0.5 * v);
      tom(ctx, st(4), out, 96, 0.42 * v);
      tom(ctx, st(10), out, 80, 0.42 * v);
    } else {
      tom(ctx, st(0), out, 84, 0.5 * v);
      snare(ctx, st(8), out, 0.3 * v);
      tom(ctx, st(12), out, 72, 0.4 * v);
    }
    if (bar % 8 === 7)
      for (let i = 12;i < 16; i++)
        snare(ctx, st(i), out, 0.1 * v + (i - 12) * 0.05);
  } else if (d === "drive") {
    for (let i = 0;i < 16; i += 2)
      kick(ctx, st(i), out, i % 4 === 0 ? 0.8 * v : 0.45 * v);
    snare(ctx, st(4), out, 0.4 * v);
    snare(ctx, st(12), out, 0.4 * v);
    for (let i = 2;i < 16; i += 4)
      hat(ctx, st(i), out, 0.14 * v);
  } else if (d === "trap") {
    kick(ctx, st(0), out, 0.9 * v);
    kick(ctx, st(7), out, 0.7 * v);
    kick(ctx, st(10), out, 0.75 * v);
    snare(ctx, st(8), out, 0.4 * v);
    for (let i = 0;i < 16; i++) {
      if (i === 12 || i === 13) {
        hat(ctx, st(i), out, 0.1 * v);
        hat(ctx, st(i) + beat / 32, out, 0.08 * v);
      } else if (i % 2 === 0)
        hat(ctx, st(i), out, 0.12 * v);
    }
  } else if (d === "boombap") {
    kick(ctx, st(0), out, 0.85 * v);
    kick(ctx, st(10), out, 0.6 * v);
    snare(ctx, st(4), out, 0.45 * v);
    snare(ctx, st(12), out, 0.45 * v);
    for (let i = 2;i < 16; i += 4)
      hat(ctx, st(i), out, 0.15 * v);
  } else if (d === "rock") {
    kick(ctx, st(0), out, 0.9 * v);
    kick(ctx, st(6), out, 0.6 * v);
    kick(ctx, st(8), out, 0.85 * v);
    snare(ctx, st(4), out, 0.5 * v);
    snare(ctx, st(12), out, 0.5 * v);
    for (let i = 0;i < 16; i += 2)
      hat(ctx, st(i), out, 0.17 * v);
    if (bar % 4 === 3)
      crash(ctx, st(14), out, 0.25 * v);
  } else if (d === "breaks") {
    kick(ctx, st(0), out, 0.85 * v);
    kick(ctx, st(9), out, 0.55 * v);
    snare(ctx, st(4), out, 0.42 * v);
    snare(ctx, st(11), out, 0.3 * v);
    snare(ctx, st(14), out, 0.35 * v);
    for (let i = 2;i < 16; i += 2)
      hat(ctx, st(i), out, 0.13 * v);
  } else if (d === "lofi") {
    kick(ctx, st(0), out, 0.7 * v);
    kick(ctx, st(9), out, 0.5 * v);
    snare(ctx, st(4), out, 0.3 * v);
    snare(ctx, st(12), out, 0.3 * v);
    for (let i = 2;i < 16; i += 4)
      hat(ctx, st(i), out, 0.1 * v);
  } else if (d === "tick") {
    hat(ctx, st(0), out, 0.14 * v);
    hat(ctx, st(8), out, 0.1 * v);
    if (bar % 4 === 3)
      boom(ctx, st(12), out, 0.4 * v);
  }
}
async function renderMusicTrack(def) {
  const beat = 60 / def.bpm;
  const barDur = beat * 4;
  const total = def.bars * barDur + 1.2;
  const sr = 44100;
  const ctx = new OfflineAudioContext(2, Math.ceil(sr * total), sr);
  const master = ctx.createGain();
  master.gain.value = 0.9;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  master.connect(comp).connect(ctx.destination);
  const drumBus = ctx.createGain();
  drumBus.gain.value = 0.9;
  drumBus.connect(master);
  const musicBus = ctx.createGain();
  musicBus.gain.value = 1;
  musicBus.connect(master);
  const scale = SCALES[def.scale];
  if (def.drums === "lofi") {
    const n = ctx.createBufferSource();
    n.buffer = noiseBuffer(ctx, total);
    n.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 3200;
    const g = ctx.createGain();
    g.gain.value = 0.014;
    n.connect(f).connect(g).connect(master);
    n.start(0);
  }
  for (let bar = 0;bar < def.bars; bar++) {
    const barT = bar * barDur;
    const chordDeg = def.chords[bar % def.chords.length];
    const intensity = Math.min(1, 0.55 + bar / def.bars * 0.6);
    const triad = [degreeToMidi(def.root, scale, chordDeg), degreeToMidi(def.root, scale, chordDeg + 2), degreeToMidi(def.root, scale, chordDeg + 4)];
    if (def.seventh)
      triad.push(degreeToMidi(def.root, scale, chordDeg + 6));
    if (def.drums !== "none")
      drumPattern(ctx, def, bar, barT, beat, drumBus, bar < 1 ? 0.7 : intensity);
    if (def.bass !== "none") {
      const rootMidi = degreeToMidi(def.root, scale, chordDeg) - 24;
      if (def.drums === "trap") {
        bassNote(ctx, barT, barDur, midiToFreq(rootMidi), musicBus, "sub", 0.55);
        bassNote(ctx, barT + beat * 2.5, beat * 1.2, midiToFreq(rootMidi + 3), musicBus, "sub", 0.45);
      } else if (def.bass === "saw") {
        for (let i = 0;i < 16; i += 2)
          bassNote(ctx, barT + i * beat / 4, beat / 2.2, midiToFreq(rootMidi), musicBus, "saw", 0.4 * intensity);
      } else if (def.bass === "pluck") {
        bassNote(ctx, barT, beat * 1.4, midiToFreq(rootMidi), musicBus, "pluck", 0.5);
        bassNote(ctx, barT + beat * 2.5, beat * 1.2, midiToFreq(rootMidi), musicBus, "pluck", 0.42);
      } else {
        bassNote(ctx, barT, barDur, midiToFreq(rootMidi), musicBus, "sub", 0.5);
      }
    }
    if (def.pad)
      padChord(ctx, barT, barDur * 1.02, triad.map((m) => m + 12), musicBus, 0.07);
    if (def.arp !== "none") {
      const steps = def.bpm >= 120 ? 8 : 4;
      for (let i = 0;i < steps; i++) {
        let deg = chordDeg + i % 3 * 2;
        if (def.arp === "down")
          deg = chordDeg + (steps - 1 - i) % 3 * 2;
        if (def.arp === "updown")
          deg = chordDeg + (i < steps / 2 ? i % 3 * 2 : (steps - i) % 3 * 2);
        const midi = degreeToMidi(def.root, scale, deg) + 24;
        pluck(ctx, barT + i * barDur / steps, midiToFreq(midi), musicBus, 0.13 * intensity, i % 2 === 0 ? -0.25 : 0.25);
      }
    }
    if (def.id === "piano-drama") {
      const seq = [0, 2, 1, 2];
      for (let i = 0;i < 4; i++) {
        const m = degreeToMidi(def.root, scale, chordDeg + seq[i]) + 12;
        pluck(ctx, barT + i * beat, midiToFreq(m), musicBus, 0.24);
        pluck(ctx, barT + i * beat, midiToFreq(m + 7), musicBus, 0.14);
      }
    }
    if (def.id === "orchestral" && bar % 2 === 1)
      stab(ctx, barT + beat * 2, triad.map((m) => m + 12), musicBus, 0.14);
    if (def.id === "blockbuster-action" && bar % 2 === 0)
      stab(ctx, barT, triad.map((m) => m + 12), musicBus, 0.16);
    if (def.id === "sport" && bar % 2 === 1)
      stab(ctx, barT + beat * 3, triad.map((m) => m + 12), musicBus, 0.15);
    if (def.id === "edm" && bar === def.bars - 8)
      riser(ctx, barT, barDur * 8, musicBus, 0.2);
    if (def.id === "cinematic-rise" && bar >= def.bars - 4)
      riser(ctx, barT, barDur * (def.bars - bar), musicBus, 0.16);
    if (def.id === "funk" && bar % 2 === 0)
      stab(ctx, barT + beat * 1.5, triad.map((m) => m + 12), musicBus, 0.12);
    if (def.id === "tropical" && bar % 4 === 2)
      pluck(ctx, barT + beat * 3.5, midiToFreq(def.root + 36), musicBus, 0.14);
    if (def.id === "hiphop" && bar % 4 === 3)
      pluck(ctx, barT + beat * 2, midiToFreq(degreeToMidi(def.root, scale, chordDeg + 2) + 12), musicBus, 0.16);
  }
  return ctx.startRendering();
}
var bufferCache = new Map;
async function getMusicBuffer(def) {
  const cached = bufferCache.get(def.id);
  if (cached)
    return cached;
  const buf = await renderMusicTrack(def);
  bufferCache.set(def.id, buf);
  return buf;
}
function musicDefById(id) {
  return MUSIC_LIBRARY.find((m) => m.id === id);
}

// node_modules/zustand/esm/vanilla.mjs
var createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set;
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const api = { setState, getState, getInitialState, subscribe };
  const initialState = state = createState(setState, getState, api);
  return api;
};
var createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;

// node_modules/zustand/esm/react.mjs
var import_react = __toESM(require_react(), 1);
var identity = (arg) => arg;
function useStore(api, selector = identity) {
  const slice = import_react.default.useSyncExternalStore(api.subscribe, import_react.default.useCallback(() => selector(api.getState()), [api, selector]), import_react.default.useCallback(() => selector(api.getInitialState()), [api, selector]));
  import_react.default.useDebugValue(slice);
  return slice;
}
var createImpl = (createState) => {
  const api = createStore(createState);
  const useBoundStore = (selector) => useStore(api, selector);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
var create = (createState) => createState ? createImpl(createState) : createImpl;

// src/lib/editor/playlistExport.ts
var CFG_VERSION = 4;
var PLAYLIST_ENHANCE_DEFAULTS = {
  enabled: true,
  speed: 1,
  loopCount: 1,
  volume: 1,
  fadeIn: 0,
  fadeOut: 0,
  effects: [],
  transitionType: null,
  transitionDuration: 0.6,
  zoom: 1,
  panX: 0,
  panY: 0
};
var PLAYLIST_EXPORT_DEFAULTS = {
  autoTitle: true,
  titleCustom: "",
  description: "",
  labelStyle: "Part",
  showTitleScreen: true,
  showPartText: true,
  titleDuringVideo: true,
  ratio: "16:9",
  fitMode: "fill",
  enhance: { ...PLAYLIST_ENHANCE_DEFAULTS },
  autoSub: false,
  subLevel: "ringan",
  parallel: 3,
  quality: "tajam",
  smartSplit: false,
  skipExisting: true,
  soundDone: true,
  autoShutdown: false,
  cfgVersion: CFG_VERSION
};

// src/lib/editor/store.ts
function totalDuration(clips) {
  return clips.reduce((m, c) => Math.max(m, c.start + c.duration), 0);
}
function dimsFor(ratio, quality) {
  return ratio === "9:16" ? { width: quality, height: Math.round(quality * 16 / 9) } : { width: Math.round(quality * 16 / 9), height: quality };
}
function makeTrack(kind, name) {
  return { id: uid("tr"), kind, name, muted: false, hidden: false };
}
function defaultTracks() {
  return [makeTrack("video", "Video 1"), makeTrack("image", "Gambar 1"), makeTrack("text", "Teks 1"), makeTrack("audio", "Audio 1")];
}
var emptyExport = { running: false, label: "", progress: 0, results: [], batchTotal: 0, batchIndex: 0 };
var useEditor = create((set, get) => ({
  project: { name: "Proyek Tanpa Judul", width: 1280, height: 720, ratio: "16:9", quality: 720 },
  assets: [],
  tracks: defaultTracks(),
  clips: [],
  playhead: 0,
  playing: false,
  selectedClipId: null,
  zoom: 60,
  snap: true,
  texts: { title: "", description: "", labelStyle: "Part", parts: 5 },
  textPreview: true,
  cover: { frameTime: 0, templateId: "impact--cyber", duration: 3, useAI: true, mode: "auto", bgStyle: "adegan", bgScope: "sama", frameStyle: "none" },
  exportSettings: {
    mode: "split",
    splitBy: "duration",
    parts: 5,
    partSeconds: 30,
    includeCover: true,
    coverDuration: 3,
    autoPartText: true,
    showTitleText: false,
    exportDir: "",
    engineMode: "fast",
    autoSub: false,
    subLevel: "ringan"
  },
  exportState: emptyExport,
  playlistExport: {
    autoTitle: true,
    titleCustom: "",
    description: "",
    labelStyle: "Part",
    showTitleScreen: true,
    showPartText: true,
    titleDuringVideo: true,
    ratio: "16:9",
    fitMode: "fill",
    enhance: { ...PLAYLIST_ENHANCE_DEFAULTS },
    autoSub: false,
    subLevel: "ringan",
    parallel: 3,
    quality: "tajam",
    smartSplit: false,
    skipExisting: true,
    soundDone: true,
    autoShutdown: false
  },
  editorList: [],
  exportList: [],
  batchJobs: [],
  uiMode: "welcome",
  setUiMode: (m) => set({ uiMode: m }),
  addToAssetList: (list, ids) => set((s) => {
    const cur = list === "editor" ? s.editorList : s.exportList;
    const add = ids.filter((id) => !cur.includes(id));
    return list === "editor" ? { editorList: [...cur, ...add] } : { exportList: [...cur, ...add] };
  }),
  removeFromAssetList: (list, id) => set((s) => list === "editor" ? { editorList: s.editorList.filter((x) => x !== id) } : { exportList: s.exportList.filter((x) => x !== id) }),
  moveInAssetList: (list, from, to) => set((s) => {
    const cur = [...list === "editor" ? s.editorList : s.exportList];
    if (from < 0 || from >= cur.length || to < 0 || to >= cur.length || from === to)
      return {};
    const [item] = cur.splice(from, 1);
    cur.splice(to, 0, item);
    return list === "editor" ? { editorList: cur } : { exportList: cur };
  }),
  transferAsset: (from, id) => set((s) => {
    if (from === "editor") {
      if (!s.editorList.includes(id))
        return {};
      return { editorList: s.editorList.filter((x) => x !== id), exportList: [...s.exportList, id] };
    }
    if (!s.exportList.includes(id))
      return {};
    return { exportList: s.exportList.filter((x) => x !== id), editorList: [...s.editorList, id] };
  }),
  clearAssetList: (list) => set(list === "editor" ? { editorList: [] } : { exportList: [] }),
  setBatchJobs: (jobs) => set({ batchJobs: jobs }),
  patchBatchJob: (id, p) => set((s) => ({ batchJobs: s.batchJobs.map((j) => j.id === id ? { ...j, ...p } : j) })),
  clearBatchJobs: () => set({ batchJobs: [] }),
  setProject: (p) => set((s) => ({ project: { ...s.project, ...p } })),
  setRatio: (r) => set((s) => {
    const dims = dimsFor(r, s.project.quality);
    return { project: { ...s.project, ratio: r, ...dims } };
  }),
  setQuality: (q) => set((s) => {
    const dims = dimsFor(s.project.ratio, q);
    return { project: { ...s.project, quality: q, ...dims } };
  }),
  addAsset: (a) => set((s) => ({ assets: [...s.assets, a] })),
  removeAsset: (id) => set((s) => ({
    assets: s.assets.filter((a) => a.id !== id),
    clips: s.clips.filter((c) => c.assetId !== id),
    editorList: s.editorList.filter((x) => x !== id),
    exportList: s.exportList.filter((x) => x !== id)
  })),
  getAsset: (id) => id ? get().assets.find((a) => a.id === id) : undefined,
  addTrack: (kind) => set((s) => {
    const count = s.tracks.filter((t2) => t2.kind === kind).length + 1;
    const labelMap = { video: "Video", image: "Gambar", text: "Teks", audio: "Audio" };
    const t = makeTrack(kind, `${labelMap[kind]} ${count}`);
    const idx = s.tracks.findIndex((x) => x.kind === "audio");
    const arr = [...s.tracks];
    if (kind === "audio" || idx === -1)
      arr.push(t);
    else
      arr.splice(idx, 0, t);
    return { tracks: arr };
  }),
  removeTrack: (id) => set((s) => ({
    tracks: s.tracks.filter((t) => t.id !== id),
    clips: s.clips.filter((c) => c.trackId !== id)
  })),
  toggleMute: (id) => set((s) => ({ tracks: s.tracks.map((t) => t.id === id ? { ...t, muted: !t.muted } : t) })),
  toggleHidden: (id) => set((s) => ({ tracks: s.tracks.map((t) => t.id === id ? { ...t, hidden: !t.hidden } : t) })),
  addClipFromAsset: (assetId, opts) => {
    const st = get();
    const asset = st.assets.find((a) => a.id === assetId);
    if (!asset)
      return null;
    const kind = asset.type === "video" ? "video" : asset.type === "audio" ? "audio" : "image";
    let trackId = opts?.trackId;
    if (!trackId) {
      const match = st.tracks.filter((t) => asset.type === "video" ? t.kind === "video" : asset.type === "audio" ? t.kind === "audio" : t.kind === "image" || t.kind === "video");
      const withClips = match.filter((t) => st.clips.some((c) => c.trackId === t.id));
      trackId = (withClips.length ? withClips[withClips.length - 1] : match[0])?.id;
    }
    if (!trackId)
      return null;
    const trackClips = st.clips.filter((c) => c.trackId === trackId);
    const start = opts?.start ?? trackClips.reduce((m, c) => Math.max(m, c.start + c.duration), 0);
    const duration = opts?.duration ?? (asset.type === "image" ? 5 : Math.max(0.2, asset.duration));
    const clip = {
      id: uid("cl"),
      trackId,
      kind,
      assetId,
      start,
      duration,
      inPoint: 0,
      speed: 1,
      loopCount: 1,
      volume: 1,
      fadeIn: asset.type === "audio" ? 0.4 : 0,
      fadeOut: asset.type === "audio" ? 0.8 : 0,
      effects: [],
      zoom: 1,
      panX: 0,
      panY: 0
    };
    set((s) => ({ clips: [...s.clips, clip], selectedClipId: clip.id }));
    return clip.id;
  },
  addTextClip: (text, opts) => {
    const st = get();
    const trackId = opts?.trackId ?? st.tracks.find((t) => t.kind === "text")?.id;
    if (!trackId)
      return null;
    const clip = {
      id: uid("cl"),
      trackId,
      kind: "text",
      start: opts?.start ?? st.playhead,
      duration: opts?.duration ?? 4,
      inPoint: 0,
      speed: 1,
      loopCount: 1,
      volume: 1,
      fadeIn: 0,
      fadeOut: 0,
      effects: [],
      zoom: 1,
      panX: 0,
      panY: 0,
      text: {
        content: text.content ?? "Teks Baru",
        sub: text.sub,
        size: text.size ?? 0.09,
        color: text.color ?? "#ffffff",
        font: text.font ?? "condensed",
        anim: text.anim ?? "rise",
        pos: text.pos ?? "bottom",
        bg: text.bg ?? "none",
        stroke: text.stroke ?? true
      }
    };
    set((s) => ({ clips: [...s.clips, clip], selectedClipId: clip.id }));
    return clip.id;
  },
  updateClip: (id, patch) => set((s) => ({ clips: s.clips.map((c) => c.id === id ? { ...c, ...patch } : c) })),
  moveClip: (id, start, trackId) => set((s) => ({
    clips: s.clips.map((c) => c.id === id ? { ...c, start: Math.max(0, start), trackId: trackId ?? c.trackId } : c)
  })),
  splitClip: (id, t) => {
    const st = get();
    const clip = st.clips.find((c) => c.id === id);
    if (!clip)
      return;
    const end = clip.start + clip.duration;
    if (t <= clip.start + 0.05 || t >= end - 0.05)
      return;
    const leftDur = t - clip.start;
    const srcSeg = clip.duration * clip.speed / Math.max(1, clip.loopCount);
    const rightIn = clip.loopCount > 1 ? clip.inPoint + leftDur * clip.speed % Math.max(0.04, srcSeg) : clip.inPoint + leftDur * clip.speed;
    const left = { ...clip, duration: leftDur, fadeOut: 0 };
    const right = {
      ...clip,
      id: uid("cl"),
      start: t,
      duration: end - t,
      inPoint: rightIn,
      transition: undefined,
      fadeIn: 0,
      label: clip.label
    };
    set((s) => ({ clips: s.clips.map((c) => c.id === id ? left : c).concat(right), selectedClipId: right.id }));
  },
  deleteClip: (id) => set((s) => ({ clips: s.clips.filter((c) => c.id !== id), selectedClipId: s.selectedClipId === id ? null : s.selectedClipId })),
  duplicateClip: (id) => {
    const st = get();
    const clip = st.clips.find((c) => c.id === id);
    if (!clip)
      return;
    const copy = { ...clip, id: uid("cl"), start: clip.start + clip.duration };
    set((s) => ({ clips: [...s.clips, copy], selectedClipId: copy.id }));
  },
  setClipSpeed: (id, speed) => set((s) => ({
    clips: s.clips.map((c) => {
      if (c.id !== id)
        return c;
      const sp = Math.max(0.25, Math.min(4, speed));
      const srcSeg = c.duration * c.speed / Math.max(1, c.loopCount);
      const newDur = Math.max(0.2, Math.min(600, srcSeg / sp));
      return { ...c, speed: sp, duration: newDur };
    })
  })),
  setClipLoop: (id, n) => set((s) => ({
    clips: s.clips.map((c) => {
      if (c.id !== id)
        return c;
      const nn = Math.max(1, Math.min(10, Math.round(n)));
      const newDur = Math.max(0.2, Math.min(600, c.duration * (nn / Math.max(1, c.loopCount))));
      return { ...c, loopCount: nn, duration: newDur };
    })
  })),
  setClipZoom: (id, zoom) => set((s) => ({
    clips: s.clips.map((c) => c.id === id ? { ...c, zoom: Math.max(1, Math.min(5, Math.round(zoom * 100) / 100)) } : c)
  })),
  nudgeClipPan: (id, dx, dy) => set((s) => ({
    clips: s.clips.map((c) => {
      if (c.id !== id)
        return c;
      const px = Math.max(-1, Math.min(1, (c.panX ?? 0) + dx));
      const py = Math.max(-1, Math.min(1, (c.panY ?? 0) + dy));
      return { ...c, panX: Math.abs(px) < 0.02 ? 0 : px, panY: Math.abs(py) < 0.02 ? 0 : py };
    })
  })),
  setClipPan: (id, x, y) => set((s) => ({
    clips: s.clips.map((c) => c.id === id ? { ...c, panX: Math.max(-1, Math.min(1, x)), panY: Math.max(-1, Math.min(1, y)) } : c)
  })),
  resetClipFraming: (id) => set((s) => ({ clips: s.clips.map((c) => c.id === id ? { ...c, zoom: 1, panX: 0, panY: 0 } : c) })),
  setClipTransition: (id, type, duration) => set((s) => ({
    clips: s.clips.map((c) => c.id === id ? { ...c, transition: type ? { type, duration: duration ?? c.transition?.duration ?? 0.6 } : undefined } : c)
  })),
  toggleClipEffect: (id, fx) => set((s) => ({
    clips: s.clips.map((c) => c.id === id ? { ...c, effects: c.effects.includes(fx) ? c.effects.filter((e) => e !== fx) : [...c.effects, fx] } : c)
  })),
  clearClipEffects: (id) => set((s) => ({ clips: s.clips.map((c) => c.id === id ? { ...c, effects: [] } : c) })),
  setPlayhead: (t) => set({ playhead: Math.max(0, t) }),
  setPlaying: (v) => set({ playing: v }),
  select: (id) => set({ selectedClipId: id }),
  setZoom: (z) => set({ zoom: Math.max(10, Math.min(240, z)) }),
  toggleSnap: () => set((s) => ({ snap: !s.snap })),
  setTexts: (p) => set((s) => ({ texts: { ...s.texts, ...p } })),
  setTextPreview: (v) => set({ textPreview: v }),
  setCover: (p) => set((s) => ({ cover: { ...s.cover, ...p } })),
  setExportSettings: (p) => set((s) => ({ exportSettings: { ...s.exportSettings, ...p } })),
  setPlaylistExport: (p) => set((s) => ({ playlistExport: { ...s.playlistExport, ...p } })),
  patchExportState: (p) => set((s) => ({ exportState: { ...s.exportState, ...p } })),
  addExportResult: (r) => set((s) => ({ exportState: { ...s.exportState, results: [...s.exportState.results, r] } })),
  clearExportResults: () => set((s) => ({ exportState: { ...s.exportState, results: [] } })),
  removeExportResult: (id) => set((s) => ({ exportState: { ...s.exportState, results: s.exportState.results.filter((r) => r.id !== id) } }))
}));
if (typeof window !== "undefined") {
  window.__NOVA__ = useEditor;
}

// src/lib/editor/textwrap.ts
function wrapCanvasText(ctx, text, maxWidth, opts) {
  if (!text)
    return [];
  maxWidth = Math.max(8, maxWidth);
  const hardBreak = (word) => {
    if (ctx.measureText(word).width <= maxWidth)
      return [word];
    const out = [];
    let cur = "";
    for (const ch of [...word]) {
      const test = cur + ch;
      if (cur && ctx.measureText(test).width > maxWidth) {
        out.push(cur);
        cur = ch;
      } else {
        cur = test;
      }
    }
    if (cur)
      out.push(cur);
    return out;
  };
  const lines = [];
  for (const raw of text.split(`
`)) {
    const words = raw.split(/\s+/).filter(Boolean);
    let cur = "";
    for (const word of words) {
      const pieces = !cur && ctx.measureText(word).width > maxWidth ? hardBreak(word) : [word];
      for (const piece of pieces) {
        const test = cur ? `${cur} ${piece}` : piece;
        if (ctx.measureText(test).width > maxWidth && cur) {
          lines.push(cur);
          cur = piece;
        } else {
          cur = test;
        }
      }
    }
    if (cur)
      lines.push(cur);
  }
  if (!lines.length)
    lines.push("");
  const maxLines = opts?.maxLines;
  if (maxLines && lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s+\S*$/, "") + "…";
    return kept;
  }
  return lines;
}

// src/lib/editor/titleFrames.ts
var TITLE_FRAMES = [
  { id: "", label: "Tanpa Bingkai", desc: "Tulisan judul polos tanpa bingkai" },
  { id: "t1", label: "Dinamis Miring", desc: "Gaya FRAME 1: banner miring dengan lapisan biru & pink" },
  { id: "t2", label: "Merah Biru", desc: "Gaya FRAME 2: bingkai merah tebal + bar biru gradien atas & bawah" },
  { id: "t3", label: "Berlian Biru", desc: "Gaya FRAME 3: banner rounded + ikon belah ketupat biru di kiri" },
  { id: "t4", label: "Mewah Emas", desc: "Gaya FRAME 4: garis emas ganda + ornamen belah ketupat & manik emas" },
  { id: "t5", label: "Emas Mahkota", desc: "Gaya FRAME 5: bingkai emas klasik dengan mahkota di tengah atas" },
  { id: "t6", label: "Kartun Oranye", desc: "Gaya FRAME 6: garis hitam tebal + bayangan oranye + aksen lucu" },
  { id: "f1", label: "HUD Cyber", desc: "Futuristik: sudut potong 45° dengan bracket cyan menyala" },
  { id: "f2", label: "Neon Ungu", desc: "Futuristik: bingkai neon ungu-magenta menyala + sirkuit samping" },
  { id: "f3", label: "Panel Sci-Fi", desc: "Futuristik: panel sudut miring ala nameplate sci-fi aksen teal" },
  { id: "f4", label: "Tech Grid", desc: "Futuristik: garis ganda biru-putih + kotak sudut & segitiga penunjuk" }
];
function saneTitleFrame(v) {
  if (typeof v !== "string")
    return "";
  return TITLE_FRAMES.some((f) => f.id === v) ? v : "";
}
function saneFrameScale(v) {
  const n = typeof v === "number" ? v : Number(v);
  if (!isFinite(n) || n <= 0)
    return 1;
  return Math.max(0.6, Math.min(2.5, n));
}
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, Math.min(w, h) / 2)));
}
function skewPath(ctx, x, y, w, h, sk) {
  ctx.beginPath();
  ctx.moveTo(x + sk, y);
  ctx.lineTo(x + w + sk * 0.35, y);
  ctx.lineTo(x + w - sk, y + h);
  ctx.lineTo(x - sk * 0.35, y + h);
  ctx.closePath();
}
function chamferPath(ctx, x, y, w, h, c) {
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + w - c, y);
  ctx.lineTo(x + w, y + c);
  ctx.lineTo(x + w, y + h - c);
  ctx.lineTo(x + w - c, y + h);
  ctx.lineTo(x + c, y + h);
  ctx.lineTo(x, y + h - c);
  ctx.lineTo(x, y + c);
  ctx.closePath();
}
function goldGrad(ctx, x, y, h) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "#7c4a12");
  g.addColorStop(0.28, "#f7d98c");
  g.addColorStop(0.52, "#c9922e");
  g.addColorStop(0.78, "#ffe9a8");
  g.addColorStop(1, "#8a5a1e");
  return g;
}
function drawTitleFrame(ctx, id, x, y, w, h) {
  if (!id)
    return;
  const lw = Math.max(1, h * 0.045);
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  switch (id) {
    case "t1": {
      const sk = h * 0.16;
      const ox = h * 0.1;
      const oy = h * 0.12;
      ctx.fillStyle = "rgba(96,165,250,0.92)";
      skewPath(ctx, x - ox * 0.4, y - oy, w, h, sk);
      ctx.fill();
      ctx.fillStyle = "rgba(244,114,182,0.92)";
      skewPath(ctx, x + ox * 0.4, y + oy, w, h, sk);
      ctx.fill();
      ctx.strokeStyle = "rgba(10,10,14,0.9)";
      ctx.lineWidth = lw;
      skewPath(ctx, x, y, w, h, sk);
      ctx.stroke();
      break;
    }
    case "t2": {
      const bh = h * 0.2;
      const bg = ctx.createLinearGradient(x, y, x + w, y + bh);
      bg.addColorStop(0, "#1e3fa8");
      bg.addColorStop(0.5, "#2563eb");
      bg.addColorStop(1, "#4f7cff");
      ctx.fillStyle = bg;
      ctx.fillRect(x + w * 0.02, y - bh * 0.55, w * 0.96, bh);
      ctx.fillRect(x + w * 0.02, y + h - bh * 0.45, w * 0.96, bh);
      ctx.strokeStyle = "rgba(127,29,29,0.85)";
      ctx.lineWidth = lw * 3;
      ctx.strokeRect(x + lw * 1.6, y + lw * 1.6, w, h);
      const rg = ctx.createLinearGradient(x, y, x + w, y + h);
      rg.addColorStop(0, "#b91c1c");
      rg.addColorStop(0.5, "#ef4444");
      rg.addColorStop(1, "#dc2626");
      ctx.strokeStyle = rg;
      ctx.lineWidth = lw * 3;
      ctx.strokeRect(x, y, w, h);
      break;
    }
    case "t3": {
      ctx.strokeStyle = "rgba(229,231,235,0.95)";
      ctx.lineWidth = lw * 1.2;
      rr(ctx, x, y, w, h, h * 0.26);
      ctx.stroke();
      const d = h * 1.05;
      const cx = x + h * 0.06;
      const cy = y + h / 2;
      ctx.save();
      ctx.translate(cx + lw * 1.2, cy + lw * 1.2);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = "rgba(30,58,138,0.9)";
      ctx.lineWidth = lw * 1.1;
      rr(ctx, -d / 2, -d / 2, d, d, d * 0.18);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      const dg = ctx.createLinearGradient(0, -d / 2, 0, d / 2);
      dg.addColorStop(0, "#3b82f6");
      dg.addColorStop(1, "#1d4ed8");
      ctx.fillStyle = dg;
      rr(ctx, -d / 2, -d / 2, d, d, d * 0.18);
      ctx.fill();
      ctx.strokeStyle = "rgba(191,219,254,0.9)";
      ctx.lineWidth = lw * 0.8;
      ctx.stroke();
      ctx.restore();
      break;
    }
    case "t4": {
      const g = goldGrad(ctx, x, y, h);
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 1.1;
      rr(ctx, x, y, w, h, h / 2);
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = lw * 0.6;
      rr(ctx, x + h * 0.14, y + h * 0.14, w - h * 0.28, h - h * 0.28, (h - h * 0.28) / 2);
      ctx.stroke();
      ctx.restore();
      const cx = x + h * 0.3;
      const cy = y + h / 2;
      const d = h * 0.4;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "rgba(20,16,8,0.4)";
      rr(ctx, -d / 2, -d / 2, d, d, d * 0.12);
      ctx.fill();
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 0.9;
      rr(ctx, -d / 2, -d / 2, d, d, d * 0.12);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#d99a2b";
      ctx.strokeStyle = "#7c4a12";
      ctx.lineWidth = lw * 0.35;
      for (const by of [cy - d * 0.94, cy + d * 0.94]) {
        ctx.beginPath();
        ctx.arc(cx, by, h * 0.055, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case "t5": {
      const g = goldGrad(ctx, x, y, h);
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 1.25;
      rr(ctx, x, y, w, h, h * 0.2);
      ctx.stroke();
      const cw = h * 0.42;
      const cx = x + w / 2;
      const ch = h * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx - cw / 2, y + lw * 0.6);
      ctx.arc(cx - cw * 0.28, y - ch * 0.28, cw * 0.22, Math.PI * 0.9, Math.PI * 1.9);
      ctx.quadraticCurveTo(cx - cw * 0.16, y - ch * 0.55, cx, y - ch);
      ctx.quadraticCurveTo(cx + cw * 0.16, y - ch * 0.55, cx + cw * 0.28, y - ch * 0.28);
      ctx.arc(cx + cw * 0.28, y - ch * 0.28, cw * 0.22, Math.PI * 1.1, Math.PI * 0.1);
      ctx.lineTo(cx + cw / 2, y + lw * 0.6);
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 1.1;
      ctx.stroke();
      break;
    }
    case "t6": {
      ctx.strokeStyle = "rgba(249,168,37,0.95)";
      ctx.lineWidth = lw * 2.4;
      const so = h * 0.1;
      const r = h * 0.3;
      ctx.beginPath();
      ctx.moveTo(x - so, y + h * 0.42);
      ctx.quadraticCurveTo(x - so, y + h + so * 0.9, x - so + r, y + h + so * 0.9);
      ctx.lineTo(x + w - r, y + h + so * 0.9);
      ctx.quadraticCurveTo(x + w + so * 0.4, y + h + so * 0.9, x + w + so * 0.4, y + h + so * 0.9 - r);
      ctx.stroke();
      ctx.strokeStyle = "rgba(12,12,16,0.94)";
      ctx.lineWidth = lw * 2;
      rr(ctx, x, y, w, h, h * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + h * 0.04, y + h * 0.03, h * 0.13, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = lw * 0.9;
      ctx.strokeStyle = "rgba(12,12,16,0.94)";
      ctx.stroke();
      const dx = x + w - h * 0.02;
      const dy = y + h * 0.02;
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(Math.PI / 4);
      const s = h * 0.22;
      ctx.fillStyle = "#f59e0b";
      rr(ctx, -s / 2, -s / 2, s, s, s * 0.15);
      ctx.fill();
      ctx.lineWidth = lw * 0.8;
      ctx.stroke();
      ctx.restore();
      const sq = h * 0.13;
      ctx.fillStyle = "#f59e0b";
      rr(ctx, dx - sq / 2, dy + h * 0.2, sq, sq, sq * 0.2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "f1": {
      ctx.shadowColor = "rgba(34,211,238,0.9)";
      ctx.shadowBlur = h * 0.22;
      ctx.strokeStyle = "rgba(34,211,238,0.9)";
      ctx.lineWidth = lw;
      chamferPath(ctx, x, y, w, h, h * 0.3);
      ctx.stroke();
      ctx.shadowBlur = 0;
      const c = h * 0.3;
      const bl = h * 0.32;
      ctx.strokeStyle = "#a5f3fc";
      ctx.lineWidth = lw * 1.8;
      ctx.beginPath();
      ctx.moveTo(x + c, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + c);
      ctx.moveTo(x + w - c, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - c);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w - bl, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + bl * 0.6);
      ctx.moveTo(x, y + h - bl * 0.6);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + bl, y + h);
      ctx.stroke();
      ctx.fillStyle = "#67e8f9";
      for (const [px, py] of [[x + c, y], [x + w - c, y], [x, y + c], [x + w, y + h - c], [x + w - c, y + h], [x + c, y + h], [x + w, y + c], [x, y + h - c]]) {
        ctx.beginPath();
        ctx.arc(px, py, h * 0.035, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(103,232,249,0.85)";
      ctx.lineWidth = lw * 0.8;
      for (let i = -2;i <= 2; i++) {
        const tx = x + w / 2 + i * h * 0.16;
        const up = i % 2 === 0;
        ctx.beginPath();
        ctx.moveTo(tx, up ? y - h * 0.1 : y - h * 0.05);
        ctx.lineTo(tx, y - h * 0.02);
        ctx.stroke();
      }
      break;
    }
    case "f2": {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, "#d946ef");
      g.addColorStop(0.5, "#a855f7");
      g.addColorStop(1, "#7c3aed");
      ctx.shadowColor = "rgba(217,70,239,0.85)";
      ctx.shadowBlur = h * 0.25;
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 1.3;
      rr(ctx, x, y, w, h, h * 0.16);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = lw * 0.6;
      rr(ctx, x + h * 0.12, y + h * 0.12, w - h * 0.24, h - h * 0.24, h * 0.1);
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 0.9;
      const my = y + h / 2;
      ctx.beginPath();
      ctx.moveTo(x - h * 0.2, my);
      ctx.lineTo(x, my);
      ctx.moveTo(x + w, my);
      ctx.lineTo(x + w + h * 0.2, my);
      ctx.stroke();
      ctx.fillStyle = "#e879f9";
      ctx.fillRect(x - h * 0.26, my - h * 0.05, h * 0.07, h * 0.1);
      ctx.fillRect(x + w + h * 0.19, my - h * 0.05, h * 0.07, h * 0.1);
      ctx.strokeStyle = "#f0abfc";
      ctx.lineWidth = lw * 0.7;
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y, h * 0.05, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h, h * 0.05, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "f3": {
      const c1 = h * 0.5;
      const c2 = h * 0.18;
      ctx.strokeStyle = "rgba(45,212,191,0.95)";
      ctx.lineWidth = lw * 1.2;
      ctx.beginPath();
      ctx.moveTo(x + c1, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + c2, y + h);
      ctx.lineTo(x, y + h - c2);
      ctx.lineTo(x, y + c1 * 0.5);
      ctx.closePath();
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = "#ccfbf1";
      ctx.lineWidth = lw * 0.6;
      ctx.beginPath();
      ctx.moveTo(x + c1 + h * 0.1, y + h * 0.12);
      ctx.lineTo(x + w - h * 0.12, y + h * 0.12);
      ctx.lineTo(x + w - h * 0.12, y + h - h * 0.12);
      ctx.lineTo(x + c2 + h * 0.08, y + h - h * 0.12);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#2dd4bf";
      const px = x + h * 0.16;
      const py = y + h / 2;
      const ps = h * 0.12;
      ctx.beginPath();
      ctx.moveTo(px, py - ps);
      ctx.lineTo(px + ps * 1.4, py);
      ctx.lineTo(px, py + ps);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(45,212,191,0.8)";
      ctx.lineWidth = lw * 0.7;
      for (let i = 0;i < 3; i++) {
        const lx = x + w - h * 0.55 + i * h * 0.18;
        ctx.beginPath();
        ctx.moveTo(lx, y + h + h * 0.06);
        ctx.lineTo(lx + h * 0.1, y + h + h * 0.06);
        ctx.stroke();
      }
      break;
    }
    case "f4": {
      ctx.strokeStyle = "rgba(191,219,254,0.9)";
      ctx.lineWidth = lw * 0.7;
      ctx.strokeRect(x, y, w, h);
      ctx.save();
      ctx.setLineDash([h * 0.22, h * 0.12]);
      ctx.strokeStyle = "rgba(59,130,246,0.95)";
      ctx.lineWidth = lw * 1.2;
      ctx.strokeRect(x + h * 0.13, y + h * 0.13, w - h * 0.26, h - h * 0.26);
      ctx.restore();
      ctx.fillStyle = "#3b82f6";
      const s = h * 0.12;
      for (const [px, py] of [[x, y], [x + w - s, y], [x, y + h - s], [x + w - s, y + h - s]]) {
        rr(ctx, px, py, s, s, s * 0.25);
        ctx.fill();
      }
      ctx.fillStyle = "#93c5fd";
      const cx = x + w / 2;
      const ts = h * 0.09;
      ctx.beginPath();
      ctx.moveTo(cx, y - ts);
      ctx.lineTo(cx + ts, y - ts * 0.1);
      ctx.lineTo(cx - ts, y - ts * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, y + h + ts);
      ctx.lineTo(cx + ts, y + h + ts * 0.1);
      ctx.lineTo(cx - ts, y + h + ts * 0.1);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// src/lib/editor/visual.ts
var easeInOut = (p) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
var easeOut = (p) => 1 - Math.pow(1 - p, 3);
var easeOutBack = (p) => {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
};
var clamp01 = (v) => Math.max(0, Math.min(1, v));
function drawCover(ctx, src, w, h, opts = {}) {
  const sw = src.width || src.naturalWidth || 2;
  const sh = src.height || src.naturalHeight || 2;
  const s = Math.max(w / sw, h / sh) * (opts.scale ?? 1);
  const dw = sw * s;
  const dh = sh * s;
  ctx.globalAlpha = opts.alpha ?? 1;
  ctx.drawImage(src, (w - dw) / 2 + (opts.dx ?? 0), (h - dh) / 2 + (opts.dy ?? 0), dw, dh);
  ctx.globalAlpha = 1;
}
function framingLayout(sw, sh, w, h, zoom) {
  const z = Math.max(1, Math.min(5, zoom || 1));
  const base = Math.min(w / Math.max(1, sw), h / Math.max(1, sh)) * z;
  const dw = sw * base;
  const dh = sh * base;
  return { base, dw, dh, overX: Math.max(0, (dw - w) / 2), overY: Math.max(0, (dh - h) / 2) };
}
function withAlpha(ctx, a, fn) {
  const old = ctx.globalAlpha;
  ctx.globalAlpha = a;
  fn();
  ctx.globalAlpha = old;
}
function applyTransition(id, ctx, a, b, p, w, h, opts = {}) {
  const e = easeInOut(p);
  const A = () => drawCover(ctx, a, w, h);
  const B = () => drawCover(ctx, b, w, h);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  switch (id) {
    case "crossfade":
      A();
      withAlpha(ctx, p, B);
      break;
    case "dip-black":
      if (p < 0.5)
        withAlpha(ctx, 1 - p * 2, A);
      else
        withAlpha(ctx, (p - 0.5) * 2, B);
      break;
    case "dip-white":
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      if (p < 0.5)
        withAlpha(ctx, 1 - p * 2, A);
      else
        withAlpha(ctx, (p - 0.5) * 2, B);
      break;
    case "flash": {
      if (p < 0.5)
        A();
      else
        B();
      const fl = Math.pow(Math.sin(p * Math.PI), 4) * 0.98;
      ctx.fillStyle = `rgba(255,255,255,${fl})`;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "whip-pan": {
      const blur = Math.sin(p * Math.PI) * 16;
      ctx.filter = `blur(${blur}px)`;
      drawCover(ctx, a, w, h, { dx: -e * w });
      drawCover(ctx, b, w, h, { dx: (1 - e) * w });
      ctx.filter = "none";
      break;
    }
    case "zoom-punch": {
      drawCover(ctx, a, w, h, { scale: 1 + 0.45 * easeOut(p), alpha: 1 - p * 0.9 });
      withAlpha(ctx, Math.min(1, p * 1.4), () => drawCover(ctx, b, w, h, { scale: 0.65 + 0.35 * easeOutBack(p) }));
      break;
    }
    case "zoom-blast": {
      ctx.filter = `blur(${p * 9}px)`;
      drawCover(ctx, a, w, h, { scale: 1 + 1.3 * p * p, alpha: 1 - p });
      ctx.filter = `blur(${(1 - p) * 9}px)`;
      withAlpha(ctx, p, () => drawCover(ctx, b, w, h, { scale: 1.55 - 0.55 * easeOut(p) }));
      ctx.filter = "none";
      break;
    }
    case "glitch-rgb": {
      const base = p < 0.5 ? a : b;
      const inten = Math.sin(p * Math.PI);
      drawCover(ctx, base, w, h);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      withAlpha(ctx, 0.3 * inten, () => {
        ctx.filter = "hue-rotate(120deg) saturate(3)";
        drawCover(ctx, base, w, h, { dx: 10 * inten });
        ctx.filter = "hue-rotate(-120deg) saturate(3)";
        drawCover(ctx, base, w, h, { dx: -10 * inten });
      });
      ctx.restore();
      ctx.filter = "none";
      for (let i = 0;i < 7; i++) {
        const sy = Math.random() * h;
        const sh = 6 + Math.random() * 36;
        const dx = (Math.random() - 0.5) * 90 * inten;
        ctx.drawImage(base, 0, sy * (base.height / h), base.width, sh * (base.height / h), dx, sy, w, sh);
      }
      break;
    }
    case "shake-impact": {
      const base = p < 0.5 ? a : b;
      const amp = Math.sin(p * Math.PI) * 22;
      drawCover(ctx, base, w, h, { scale: 1.03, dx: (Math.random() - 0.5) * amp, dy: (Math.random() - 0.5) * amp });
      break;
    }
    case "bars-reveal": {
      if (p < 0.5) {
        A();
        const bh = easeInOut(p * 2) * (h / 2);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, bh);
        ctx.fillRect(0, h - bh, w, bh);
      } else {
        B();
        const bh = (1 - easeInOut((p - 0.5) * 2)) * (h / 2);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, bh);
        ctx.fillRect(0, h - bh, w, bh);
      }
      break;
    }
    case "film-burn": {
      A();
      withAlpha(ctx, clamp01((p - 0.35) / 0.3), B);
      const cx = w * (-0.25 + 1.5 * p);
      const cy = h * 0.5;
      const r = w * 0.3;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(255,255,220,0.95)");
      g.addColorStop(0.4, "rgba(255,150,40,0.75)");
      g.addColorStop(0.75, "rgba(200,40,10,0.35)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = Math.sin(p * Math.PI);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      break;
    }
    case "slide-l":
      A();
      drawCover(ctx, a, w, h, { dx: 0 });
      withAlpha(ctx, 1, () => drawCover(ctx, b, w, h, { dx: (1 - e) * w }));
      break;
    case "slide-r":
      A();
      withAlpha(ctx, 1, () => drawCover(ctx, b, w, h, { dx: -(1 - e) * w }));
      break;
    case "slide-u":
      A();
      withAlpha(ctx, 1, () => drawCover(ctx, b, w, h, { dy: -(1 - e) * h }));
      break;
    case "slide-d":
      A();
      withAlpha(ctx, 1, () => drawCover(ctx, b, w, h, { dy: (1 - e) * h }));
      break;
    case "push-l":
      drawCover(ctx, a, w, h, { dx: -e * w });
      drawCover(ctx, b, w, h, { dx: (1 - e) * w });
      break;
    case "wipe-diag": {
      A();
      ctx.save();
      ctx.beginPath();
      const xTop = w * (2 * e - 1) + w * 0.3;
      const xBot = w * (2 * e - 1) - w * 0.1;
      ctx.moveTo(xBot, h);
      ctx.lineTo(xTop, 0);
      ctx.lineTo(w + 2, 0);
      ctx.lineTo(w + 2, h);
      ctx.closePath();
      ctx.clip();
      B();
      ctx.restore();
      const lx = e * (w * 1.4);
      const grad = ctx.createLinearGradient(lx - 60, 0, lx + 60, 0);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, `rgba(255,255,255,${Math.sin(p * Math.PI) * 0.7})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(lx - 60, 0, 120, h);
      break;
    }
    case "iris": {
      A();
      const r = e * Math.hypot(w, h) * 0.55;
      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.clip();
      B();
      ctx.restore();
      ctx.strokeStyle = opts.accent ?? "#fff";
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.6;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }
    case "blinds": {
      A();
      const n = 8;
      for (let i = 0;i < n; i++) {
        const lp = clamp01(p * 1.5 - i / n * 0.5);
        if (lp <= 0)
          continue;
        const y = i * h / n;
        const bh = h / n * easeInOut(lp);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, y, w, bh);
        ctx.clip();
        B();
        ctx.restore();
      }
      break;
    }
    case "split-v": {
      A();
      const half = w / 2 * e;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, half, h);
      ctx.clip();
      drawCover(ctx, b, w, h, { dx: -(w / 2 * (1 - e)) });
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.rect(w - half, 0, half + 1, h);
      ctx.clip();
      drawCover(ctx, b, w, h, { dx: w / 2 * (1 - e) });
      ctx.restore();
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillRect(w / 2 - 1.5, 0, 3, h * Math.sin(p * Math.PI));
      break;
    }
    case "bounce": {
      A();
      const s = easeOutBack(p);
      withAlpha(ctx, Math.min(1, p * 2.5), () => drawCover(ctx, b, w, h, { scale: s }));
      break;
    }
    case "flare-sweep": {
      A();
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w * e, h);
      ctx.clip();
      B();
      ctx.restore();
      const x = w * p;
      const grad = ctx.createLinearGradient(x - w * 0.18, 0, x + w * 0.18, 0);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, `rgba(255,250,220,${Math.sin(p * Math.PI) * 0.85})`);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = grad;
      ctx.fillRect(x - w * 0.18, 0, w * 0.36, h);
      ctx.restore();
      break;
    }
    case "blur-dissolve": {
      ctx.filter = `blur(${p * 12}px)`;
      A();
      ctx.filter = `blur(${(1 - p) * 12}px)`;
      withAlpha(ctx, p, B);
      ctx.filter = "none";
      break;
    }
    case "spin-swap": {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(e * Math.PI * 0.5);
      ctx.globalAlpha = 1 - p;
      const s1 = 1 - e * 0.5;
      ctx.drawImage(a, -w * s1 / 2, -h * s1 / 2, w * s1, h * s1);
      ctx.restore();
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((e - 1) * Math.PI * 0.5);
      ctx.globalAlpha = p;
      const s2 = 0.5 + 0.5 * e;
      ctx.drawImage(b, -w * s2 / 2, -h * s2 / 2, w * s2, h * s2);
      ctx.restore();
      ctx.globalAlpha = 1;
      break;
    }
    case "pixelate": {
      const base = p < 0.5 ? a : b;
      const px = Math.max(2, Math.round(Math.sin(p * Math.PI) * 48));
      const sc = opts.scratch;
      if (sc) {
        const tw = Math.max(2, Math.round(w / px));
        const th = Math.max(2, Math.round(h / px));
        sc.width = tw;
        sc.height = th;
        const sctx = sc.getContext("2d");
        if (sctx) {
          sctx.drawImage(base, 0, 0, tw, th);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(sc, 0, 0, w, h);
          ctx.imageSmoothingEnabled = true;
        }
      } else
        drawCover(ctx, base, w, h);
      break;
    }
    case "tv-static": {
      const base = p < 0.45 ? a : b;
      drawCover(ctx, base, w, h);
      const inten = Math.pow(Math.sin(p * Math.PI), 1.4);
      if (opts.noise && inten > 0.02) {
        ctx.save();
        ctx.globalAlpha = inten;
        ctx.imageSmoothingEnabled = false;
        const nz = opts.noise;
        const ox = -Math.random() * 200;
        const oy = -Math.random() * 200;
        for (let x = ox;x < w; x += nz.width)
          for (let y = oy;y < h; y += nz.height)
            ctx.drawImage(nz, x, y);
        ctx.restore();
      }
      break;
    }
    case "chroma-slide": {
      const inten = Math.sin(p * Math.PI);
      drawCover(ctx, a, w, h, { dx: -e * w * 0.35, alpha: 1 - p * 0.6 });
      drawCover(ctx, b, w, h, { dx: (1 - e) * w });
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      withAlpha(ctx, 0.35 * inten, () => {
        ctx.filter = "hue-rotate(140deg) saturate(4)";
        drawCover(ctx, b, w, h, { dx: (1 - e) * w - 12 * inten });
        ctx.filter = "hue-rotate(-140deg) saturate(4)";
        drawCover(ctx, b, w, h, { dx: (1 - e) * w + 12 * inten });
      });
      ctx.restore();
      ctx.filter = "none";
      break;
    }
    case "mosaic": {
      A();
      const cols = 7;
      const rows = 4;
      for (let i = 0;i < cols; i++) {
        for (let j = 0;j < rows; j++) {
          const seed = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
          const rndCell = seed - Math.floor(seed);
          const lp = clamp01((p - rndCell * 0.4) / 0.6);
          if (lp <= 0)
            continue;
          const cw = w / cols;
          const chh = h / rows;
          ctx.save();
          ctx.beginPath();
          ctx.rect(i * cw, j * chh, cw * easeOut(lp), chh * easeOut(lp));
          ctx.clip();
          B();
          ctx.restore();
        }
      }
      break;
    }
    default:
      A();
      withAlpha(ctx, p, B);
  }
}
var GRADE_FILTERS = {
  "grade-teal": "contrast(1.18) saturate(1.3)",
  "grade-bleach": "contrast(1.45) saturate(0.5) brightness(1.08)",
  "grade-noir": "grayscale(1) contrast(1.3) brightness(1.02)",
  "grade-vintage": "sepia(0.45) contrast(0.95) saturate(0.85) brightness(1.05)",
  "grade-vhs": "saturate(1.35) contrast(1.12) brightness(1.02)",
  "grade-cyber": "saturate(1.55) contrast(1.18)",
  "grade-golden": "brightness(1.06) saturate(1.18) sepia(0.22)",
  "grade-cold": "saturate(0.9) contrast(1.22) brightness(0.96) hue-rotate(10deg)"
};
function gradeFilterString(effects) {
  const parts = effects.map((e) => GRADE_FILTERS[e]).filter(Boolean);
  return parts.length ? parts.join(" ") : "none";
}
var GRADE_TINTS = {
  "grade-teal": [
    { color: "rgba(25,90,110,0.22)", mode: "multiply", alpha: 1 },
    { color: "rgba(255,150,60,0.16)", mode: "overlay", alpha: 1 }
  ],
  "grade-vintage": [{ color: "rgba(120,80,40,0.18)", mode: "multiply", alpha: 1 }],
  "grade-vhs": [
    { color: "rgba(40,60,120,0.12)", mode: "multiply", alpha: 1 },
    { color: "rgba(255,0,120,0.06)", mode: "screen", alpha: 1 }
  ],
  "grade-cyber": [
    { color: "rgba(60,20,90,0.22)", mode: "multiply", alpha: 1 },
    { color: "rgba(0,190,255,0.10)", mode: "screen", alpha: 1 }
  ],
  "grade-golden": [{ color: "rgba(255,170,60,0.20)", mode: "overlay", alpha: 1 }],
  "grade-cold": [{ color: "rgba(40,70,110,0.24)", mode: "multiply", alpha: 1 }],
  "grade-bleach": [{ color: "rgba(220,225,235,0.07)", mode: "screen", alpha: 1 }]
};
function applyGradeTints(ctx, effects, w, h) {
  for (const fx of effects) {
    const tints = GRADE_TINTS[fx];
    if (!tints)
      continue;
    for (const t of tints) {
      ctx.save();
      ctx.globalCompositeOperation = t.mode;
      ctx.fillStyle = t.color;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }
}
function applyOverlays(ctx, effects, w, h, o) {
  for (const fx of effects) {
    switch (fx) {
      case "fx-rgb": {
        const sc = o.scratch;
        if (sc) {
          sc.width = w;
          sc.height = h;
          const sctx = sc.getContext("2d");
          if (sctx) {
            sctx.clearRect(0, 0, w, h);
            sctx.drawImage(ctx.canvas, 0, 0);
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = 0.35;
            ctx.filter = "hue-rotate(120deg) saturate(3)";
            ctx.drawImage(sc, 4, 0, w, h);
            ctx.filter = "hue-rotate(-120deg) saturate(3)";
            ctx.drawImage(sc, -4, 0, w, h);
            ctx.restore();
            ctx.filter = "none";
          }
        }
        break;
      }
      case "fx-echo": {
        const sc = o.scratch;
        if (sc) {
          sc.width = w;
          sc.height = h;
          const sctx = sc.getContext("2d");
          if (sctx) {
            sctx.clearRect(0, 0, w, h);
            sctx.drawImage(ctx.canvas, 0, 0);
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            for (let k = 1;k <= 3; k++) {
              ctx.globalAlpha = 0.16 / k;
              ctx.drawImage(sc, -k * 14, 0, w, h);
            }
            ctx.restore();
          }
        }
        break;
      }
      case "fx-scanline": {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.16)";
        for (let y = 0;y < h; y += 4)
          ctx.fillRect(0, y, w, 2);
        ctx.restore();
        break;
      }
      case "fx-vignette": {
        const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.38, w / 2, h / 2, Math.hypot(w, h) * 0.6);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(0,0,0,0.55)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        break;
      }
      case "fx-spotlight": {
        const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.12, w / 2, h / 2, Math.hypot(w, h) * 0.55);
        g.addColorStop(0, "rgba(255,245,220,0.10)");
        g.addColorStop(0.5, "rgba(0,0,0,0.15)");
        g.addColorStop(1, "rgba(0,0,0,0.78)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        break;
      }
      case "fx-grain": {
        if (o.grainPattern) {
          ctx.save();
          ctx.globalAlpha = 0.09;
          ctx.translate(-Math.random() * 256, -Math.random() * 256);
          ctx.fillStyle = o.grainPattern;
          ctx.fillRect(0, 0, w + 256, h + 256);
          ctx.restore();
        }
        break;
      }
      case "fx-letterbox": {
        const bh = h * 0.115;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, bh);
        ctx.fillRect(0, h - bh, w, bh);
        break;
      }
      case "fx-bloom": {
        const sc = o.scratch;
        if (sc) {
          sc.width = w;
          sc.height = h;
          const sctx = sc.getContext("2d");
          if (sctx) {
            sctx.clearRect(0, 0, w, h);
            sctx.drawImage(ctx.canvas, 0, 0);
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = 0.32;
            ctx.filter = "blur(16px) brightness(1.3) saturate(1.2)";
            ctx.drawImage(sc, 0, 0, w, h);
            ctx.restore();
            ctx.filter = "none";
          }
        }
        break;
      }
      case "fx-flare": {
        const cx = w * (0.25 + 0.5 * (o.t * 0.13 % 1));
        const cy = h * 0.3;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.22);
        g.addColorStop(0, "rgba(255,240,200,0.55)");
        g.addColorStop(0.35, "rgba(255,180,90,0.22)");
        g.addColorStop(1, "rgba(255,120,40,0)");
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
        break;
      }
    }
  }
}
function clipTransform(effects, local, progress, t) {
  let scale = 1;
  let dx = 0;
  let dy = 0;
  if (effects.includes("fx-kenburns")) {
    scale *= 1 + 0.14 * progress;
    dx += (progress - 0.5) * 40;
    dy -= (progress - 0.5) * 18;
  }
  if (effects.includes("fx-pulse")) {
    scale *= 1 + 0.035 * Math.max(0, Math.sin(local * Math.PI * 2 * 2));
  }
  if (effects.includes("fx-shake")) {
    dx += Math.sin(t * 23.7) * 5 + Math.sin(t * 41.3) * 3;
    dy += Math.cos(t * 19.1) * 5 + Math.sin(t * 33.7) * 3;
  }
  return { scale, dx, dy };
}

// src/lib/editor/engine.ts
var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function clampOff(v) {
  return typeof v === "number" && isFinite(v) ? Math.max(-0.45, Math.min(0.45, v)) : 0;
}
function drawTextOverlay(ctx, w, h, td, local, absT, dur = 4) {
  const inDur = Math.min(0.55, dur * 0.35);
  const inP = clamp(local / Math.max(0.05, inDur), 0, 1);
  const outP = clamp((dur - local) / Math.min(0.4, dur * 0.3), 0, 1);
  let alpha = Math.min(inP >= 1 ? 1 : inP, outP);
  let dy = 0;
  let scale = 1;
  const content = td.content;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const maxW = w * 0.86;
  const computeLayout = (sz) => {
    ctx.font = `900 ${sz}px ${fontStack(td.font)}`;
    const ls = wrapCanvasText(ctx, content, maxW);
    let textW = 0;
    for (const l of ls)
      textW = Math.max(textW, ctx.measureText(l).width);
    const subSz = td.subSize && td.subSize > 0 ? td.subSize * h : sz * 0.42;
    let subs2 = [];
    if (td.sub) {
      ctx.font = `600 ${subSz}px ${fontStack(td.subFont || "sans")}`;
      subs2 = wrapCanvasText(ctx, td.sub, maxW);
      for (const sl of subs2)
        textW = Math.max(textW, ctx.measureText(sl).width);
    }
    const lh = sz * 1.12;
    const bh = ls.length * lh + (subs2.length ? subs2.length * subSz * 1.3 + subSz * 0.25 : 0);
    return { ls, subs: subs2, subSz, lineH: lh, blockH: bh, textW };
  };
  let size = td.size * h;
  let layout = computeLayout(size);
  for (let guard = 0;layout.blockH > h * 0.8 && guard < 8; guard++) {
    size *= 0.86;
    layout = computeLayout(size);
  }
  const { ls: lines, subs, subSz: subSize, lineH, blockH } = layout;
  ctx.font = `900 ${size}px ${fontStack(td.font)}`;
  const offY = clampOff(td.offY) * h;
  const posV = typeof td.posV === "number" && isFinite(td.posV) ? Math.max(0, Math.min(1, td.posV)) : null;
  const posYBase = posV !== null ? posV * h : td.pos === "top" ? h * 0.16 + blockH / 2 : td.pos === "center" ? h / 2 : h * 0.86 - blockH / 2;
  let posY = posYBase + offY;
  if (posV !== null) {
    const frH = td.frame ? Math.max(size * 1.7, (blockH + size * 0.84) * saneFrameScale(td.frameH)) : 0;
    const half = Math.max(blockH / 2, frH / 2) + size * 0.12;
    posY = Math.min(Math.max(posY, half), h - half);
  }
  switch (td.anim) {
    case "rise":
      dy = (1 - easeOut(inP)) * h * 0.09;
      alpha *= inP;
      break;
    case "slam": {
      const p = easeOut(Math.min(1, inP * 1.15));
      scale = 1 + (1 - p) * 1.6;
      alpha *= Math.min(1, inP * 2.2) * outP;
      if (local < 0.32 && inP >= 0.95) {
        dy = (Math.random() - 0.5) * 8;
      }
      break;
    }
    case "neon":
      alpha *= 0.78 + 0.22 * Math.abs(Math.sin(absT * 18));
      break;
    case "tracking": {
      alpha *= inP;
      break;
    }
    case "glitch":
      alpha *= inP;
      break;
    case "wipe":
      alpha = 1;
      break;
    default:
      alpha *= inP;
  }
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.translate(w / 2, posY + dy);
  if (scale !== 1)
    ctx.scale(scale, scale);
  ctx.translate(-w / 2, -posY);
  if (td.bg !== "none") {
    const padX = w * 0.03;
    const padY = size * 0.35;
    if (td.bg === "bar") {
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.fillRect(0, posY + dy - blockH / 2 - padY, w, blockH + padY * 2);
    } else if (td.bg === "box") {
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      const bx = Math.max(size * 0.3, w / 2 - maxW / 2 - padX);
      ctx.beginPath();
      ctx.roundRect(bx, posY + dy - blockH / 2 - padY, w - bx * 2, blockH + padY * 2, 12);
      ctx.fill();
    } else if (td.bg === "gradient") {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(0,0,0,0.75)");
      g.addColorStop(0.4, "rgba(0,0,0,0)");
      g.addColorStop(0.75, "rgba(0,0,0,0.75)");
      g.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  }
  if (td.frame) {
    const frId = saneTitleFrame(td.frame);
    if (frId) {
      const offXf = clampOff(td.offX) * w;
      ctx.save();
      ctx.translate(offXf, 0);
      const padX = size * 0.85;
      const padY = size * 0.42;
      const fw = Math.max(size * 1.6, (layout.textW + padX * 2) * saneFrameScale(td.frameW));
      const fh = Math.max(size * 1.7, (blockH + padY * 2) * saneFrameScale(td.frameH));
      drawTitleFrame(ctx, frId, w / 2 - fw / 2, posY + dy - fh / 2, fw, fh);
      ctx.restore();
    }
  }
  const drawLines = (drawer) => {
    lines.forEach((ln, i) => drawer(ln, i));
  };
  const baseY = posY + dy - blockH / 2 + lineH / 2;
  const yFor = (i) => baseY + i * lineH;
  if (td.bg === "none" && td.stroke) {
    ctx.lineWidth = Math.max(2, size * 0.09);
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.lineJoin = "round";
  }
  const paintLine = (ln, y) => {
    if (td.bg === "none" && td.stroke)
      ctx.strokeText(ln, w / 2, y);
    ctx.fillStyle = td.color;
    ctx.fillText(ln, w / 2, y);
  };
  const offX = clampOff(td.offX) * w;
  const subOffX = clampOff(td.subOffX ?? td.offX) * w;
  const subOffY = clampOff(td.subOffY) * h;
  ctx.save();
  ctx.translate(offX, 0);
  switch (td.anim) {
    case "typewriter": {
      const full = lines.join(`
`);
      const nChars = Math.floor(full.length * Math.pow(inP, 0.85));
      let used = 0;
      drawLines((ln, i) => {
        const avail = Math.max(0, nChars - used);
        used += ln.length + 1;
        const shown = ln.slice(0, avail);
        const y = yFor(i);
        if (td.bg === "none" && td.stroke) {
          ctx.strokeText(shown, w / 2, y);
        }
        ctx.fillStyle = td.color;
        ctx.fillText(shown, w / 2, y);
        if (avail <= ln.length && avail > 0 && Math.floor(absT * 3) % 2 === 0) {
          const cw = ctx.measureText(shown).width;
          ctx.fillRect(w / 2 + cw / 2 + 4, y - size * 0.42, size * 0.08, size * 0.84);
        }
      });
      break;
    }
    case "tracking": {
      const spread = (1 - easeOut(inP)) * size * 0.5;
      drawLines((ln, i) => {
        const chars = [...ln];
        const widths = chars.map((ch) => ctx.measureText(ch).width + spread);
        const totalW = widths.reduce((a, b) => a + b, 0);
        let x = w / 2 - totalW / 2;
        const y = yFor(i);
        for (let ci = 0;ci < chars.length; ci++) {
          if (td.bg === "none" && td.stroke)
            ctx.strokeText(chars[ci], x + widths[ci] / 2, y);
          ctx.fillStyle = td.color;
          ctx.fillText(chars[ci], x + widths[ci] / 2, y);
          x += widths[ci];
        }
      });
      break;
    }
    case "glitch": {
      drawLines((ln, i) => {
        const y = yFor(i);
        const jx = () => (Math.random() - 0.5) * size * 0.12 * (Math.random() > 0.7 ? 2.2 : 1);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = clamp(alpha, 0, 1) * 0.6;
        ctx.fillStyle = "#ff2d55";
        ctx.fillText(ln, w / 2 + jx(), y);
        ctx.fillStyle = "#00e5ff";
        ctx.fillText(ln, w / 2 + jx(), y);
        ctx.restore();
        if (td.bg === "none" && td.stroke)
          ctx.strokeText(ln, w / 2, y);
        ctx.fillStyle = td.color;
        ctx.fillText(ln, w / 2 + jx() * 0.3, y);
      });
      break;
    }
    case "neon": {
      ctx.save();
      ctx.shadowColor = td.color;
      ctx.shadowBlur = size * 0.45;
      drawLines((ln, i) => {
        ctx.fillStyle = "#fff";
        ctx.fillText(ln, w / 2, yFor(i));
        ctx.fillText(ln, w / 2, yFor(i));
      });
      ctx.restore();
      break;
    }
    case "wipe": {
      const rev = easeOut(inP);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w * rev, h);
      ctx.clip();
      drawLines((ln, i) => paintLine(ln, yFor(i)));
      ctx.restore();
      break;
    }
    default:
      drawLines((ln, i) => paintLine(ln, yFor(i)));
  }
  ctx.restore();
  if (subs.length) {
    ctx.save();
    ctx.translate(subOffX, 0);
    ctx.font = `600 ${subSize}px ${fontStack(td.subFont || "sans")}`;
    const subLineH = subSize * 1.3;
    const sy0 = baseY + lines.length * lineH + subSize * 0.4 + subOffY;
    subs.forEach((sl, i) => {
      const sy = sy0 + i * subLineH;
      if (td.bg === "none" && td.stroke) {
        ctx.lineWidth = Math.max(2, subSize * 0.14);
        ctx.strokeText(sl, w / 2, sy);
      }
      ctx.fillStyle = td.color;
      ctx.fillText(sl, w / 2, sy);
    });
    ctx.restore();
  }
  ctx.restore();
}
function makeNoiseCanvas(w, h, alpha) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (ctx) {
    const img = ctx.createImageData(w, h);
    for (let i = 0;i < img.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = alpha ? 255 : Math.random() * 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  return c;
}

class EditorEngine {
  canvas = null;
  ctx = null;
  scratch = document.createElement("canvas");
  tmpA = document.createElement("canvas");
  tmpB = document.createElement("canvas");
  grain = makeNoiseCanvas(256, 256, false);
  tvNoise = makeNoiseCanvas(240, 135, true);
  grainPattern = null;
  els = new Map;
  gains = new Map;
  mediaSrcs = new Map;
  musicSessions = new Map;
  loadingMusic = new Set;
  musicBuffers = new Map;
  previewSource = null;
  audioCtx = null;
  recDest = null;
  session = 0;
  raf = 0;
  renderRaf = 0;
  lastTs = 0;
  playing = false;
  stopAt = null;
  onDone = null;
  attach(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    const { width, height } = useEditor.getState().project;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    if (this.ctx) {
      this.grainPattern = this.ctx.createPattern(this.grain, "repeat");
      this.renderFrame(useEditor.getState().playhead);
    }
  }
  syncSize() {
    if (!this.canvas)
      return;
    const { width, height } = useEditor.getState().project;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.requestRender();
  }
  requestRender() {
    if (this.renderRaf)
      return;
    this.renderRaf = requestAnimationFrame(() => {
      this.renderRaf = 0;
      if (!this.playing)
        this.renderFrame(useEditor.getState().playhead);
    });
  }
  ensureAudio() {
    if (!this.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC)
        return;
      this.audioCtx = new AC;
      this.recDest = this.audioCtx.createMediaStreamDestination();
      for (const g of this.gains.values()) {
        try {
          g.connect(this.recDest);
        } catch {}
      }
    }
    if (this.audioCtx.state === "suspended")
      this.audioCtx.resume();
  }
  routeElementAudio(key, el) {
    const ctx = this.audioCtx;
    if (!ctx || this.mediaSrcs.has(key))
      return;
    try {
      const src = ctx.createMediaElementSource(el);
      const g = this.gainFor(key);
      if (g)
        src.connect(g);
      this.mediaSrcs.set(key, src);
    } catch {}
  }
  elKey(clip) {
    return `${clip.kind}:${clip.assetId ?? clip.id}`;
  }
  elFor(clip, assets) {
    const st = useEditor.getState();
    const asset = (assets ?? st.assets).find((a) => a.id === clip.assetId);
    if (!asset)
      return null;
    const key = this.elKey(clip);
    let el = this.els.get(key);
    if (el)
      return el;
    if (asset.musicId)
      return null;
    if (clip.kind === "video") {
      const v = document.createElement("video");
      v.src = asset.url;
      v.preload = "auto";
      v.playsInline = true;
      v.crossOrigin = "anonymous";
      v.addEventListener("loadeddata", () => this.requestRender(), { once: true });
      el = v;
    } else if (clip.kind === "audio") {
      const a = document.createElement("audio");
      a.src = asset.url;
      a.preload = "auto";
      a.crossOrigin = "anonymous";
      el = a;
    } else {
      const img = new Image;
      img.src = asset.url;
      img.onload = () => this.requestRender();
      el = img;
    }
    this.els.set(key, el);
    return el;
  }
  gainFor(key) {
    if (!this.audioCtx)
      return null;
    let g = this.gains.get(key);
    if (!g) {
      g = this.audioCtx.createGain();
      g.connect(this.audioCtx.destination);
      if (this.recDest)
        g.connect(this.recDest);
      this.gains.set(key, g);
    }
    return g;
  }
  clipVolume(clip, track, local) {
    const fi = clip.fadeIn > 0 ? clamp(local / clip.fadeIn, 0, 1) : 1;
    const fo = clip.fadeOut > 0 ? clamp((clip.duration - local) / clip.fadeOut, 0, 1) : 1;
    return clip.volume * (track.muted ? 0 : 1) * Math.min(fi, fo);
  }
  syncMedia(clip, track, t, playing, forDraw) {
    const el = this.elFor(clip);
    if (!el || !(el instanceof HTMLVideoElement))
      return null;
    const local = t - clip.start;
    const srcSeg = clip.duration * clip.speed / Math.max(1, clip.loopCount);
    const srcTime = clip.inPoint + local * clip.speed % Math.max(0.033, srcSeg);
    const rate = clamp(clip.speed, 0.25, 4);
    if (el.playbackRate !== rate) {
      try {
        el.playbackRate = rate;
      } catch {}
    }
    const v = this.clipVolume(clip, track, local);
    if (this.audioCtx) {
      this.routeElementAudio(this.elKey(clip), el);
      el.volume = 1;
      el.muted = false;
      const g = this.gainFor(this.elKey(clip));
      if (g)
        g.gain.value = v;
    } else {
      const g = this.gainFor(this.elKey(clip));
      if (g)
        g.gain.value = v;
      else {
        el.volume = clamp(v, 0, 1);
        el.muted = track.muted;
      }
    }
    if (playing) {
      if (el.paused) {
        try {
          el.currentTime = Math.min(srcTime, Math.max(0, (el.duration || 0) - 0.02));
        } catch {}
        el.play().catch(() => {});
      } else if (Math.abs(el.currentTime - srcTime) > 0.35 && !el.seeking) {
        try {
          el.currentTime = Math.min(srcTime, Math.max(0, (el.duration || 0) - 0.02));
        } catch {}
      }
    } else {
      if (!el.paused)
        el.pause();
      if (Math.abs(el.currentTime - srcTime) > 0.03 && !el.seeking) {
        try {
          el.currentTime = Math.min(srcTime, Math.max(0, (el.duration || 0) - 0.02));
        } catch {}
      }
    }
    return forDraw ? el : null;
  }
  syncAudioEl(clip, track, t, playing) {
    const el = this.elFor(clip);
    if (!el || !(el instanceof HTMLAudioElement))
      return;
    const local = t - clip.start;
    const srcTime = clip.inPoint + local * clip.speed;
    const v = this.clipVolume(clip, track, local);
    if (this.audioCtx) {
      this.routeElementAudio(this.elKey(clip), el);
      el.volume = 1;
      el.muted = false;
      const g = this.gainFor(this.elKey(clip));
      if (g)
        g.gain.value = v;
    } else {
      const g = this.gainFor(this.elKey(clip));
      if (g)
        g.gain.value = v;
      else {
        el.volume = clamp(v, 0, 1);
        el.muted = track.muted;
      }
    }
    if (playing) {
      if (el.paused) {
        try {
          el.currentTime = srcTime;
        } catch {}
        el.play().catch(() => {});
      } else if (Math.abs(el.currentTime - srcTime) > 0.35 && !el.seeking) {
        try {
          el.currentTime = srcTime;
        } catch {}
      }
    } else if (!el.paused)
      el.pause();
  }
  async loadMusic(assetId, musicId) {
    if (this.musicBuffers.has(assetId) || this.loadingMusic.has(assetId))
      return;
    this.loadingMusic.add(assetId);
    const def = musicDefById(musicId);
    if (!def)
      return;
    try {
      const buf = await getMusicBuffer(def);
      this.musicBuffers.set(assetId, buf);
      this.requestRender();
    } finally {
      this.loadingMusic.delete(assetId);
    }
  }
  stopMusicSession(clipId) {
    const m = this.musicSessions.get(clipId);
    if (m) {
      try {
        m.src.stop();
      } catch {}
      this.musicSessions.delete(clipId);
    }
  }
  syncMusic(clip, track, t, playing) {
    const st = useEditor.getState();
    const asset = st.assets.find((a) => a.id === clip.assetId);
    if (!asset?.musicId)
      return;
    const buf = this.musicBuffers.get(asset.id);
    if (!buf) {
      this.loadMusic(asset.id, asset.musicId);
      return;
    }
    const local = t - clip.start;
    const v = this.clipVolume(clip, track, local);
    if (!playing) {
      this.stopMusicSession(clip.id);
      return;
    }
    let m = this.musicSessions.get(clip.id);
    if (!m || m.session !== this.session) {
      this.stopMusicSession(clip.id);
      if (!this.audioCtx)
        return;
      const src = this.audioCtx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const gain = this.audioCtx.createGain();
      gain.gain.value = v;
      src.connect(gain);
      gain.connect(this.audioCtx.destination);
      if (this.recDest)
        gain.connect(this.recDest);
      const offset = local % buf.duration;
      try {
        src.start(0, Math.max(0, offset));
      } catch {
        return;
      }
      m = { src, gain, session: this.session };
      this.musicSessions.set(clip.id, m);
    } else {
      m.gain.gain.value = v;
    }
  }
  drawMediaFrame(ctx, clip, t, w, h, noSync = false, rs, work) {
    const stStore = useEditor.getState();
    const st = rs ? { ...stStore, clips: rs.clips, tracks: rs.tracks, assets: rs.assets } : stStore;
    const track = st.tracks.find((tr) => tr.id === clip.trackId);
    const local = t - clip.start;
    const progress = clamp(local / Math.max(0.01, clip.duration), 0, 1);
    const asset = st.assets.find((a) => a.id === clip.assetId);
    if (clip.kind === "text" && clip.text) {
      this.drawTextClip(ctx, clip, t, w, h);
      return;
    }
    if (!asset)
      return;
    let src = null;
    let sw = 0;
    let sh = 0;
    if (clip.kind === "video") {
      const vf = work?.videoFrames?.get(clip.assetId ?? clip.id);
      if (vf) {
        src = vf;
        sw = vf.displayWidth;
        sh = vf.displayHeight;
      } else {
        const el = noSync ? this.elFor(clip, rs?.assets) : this.syncMedia(clip, track ?? { id: "", kind: "video", name: "", muted: false, hidden: false }, t, this.playing, true);
        if (el && el.videoWidth) {
          src = el;
          sw = el.videoWidth;
          sh = el.videoHeight;
        }
      }
    } else if (clip.kind === "image") {
      const el = this.elFor(clip, rs?.assets);
      if (el instanceof HTMLImageElement && el.complete && el.naturalWidth) {
        src = el;
        sw = el.naturalWidth;
        sh = el.naturalHeight;
      }
    }
    if (src) {
      const fx = clip.effects;
      const tr = clipTransform(fx, local, progress, t);
      ctx.save();
      ctx.filter = gradeFilterString(fx);
      const layout = framingLayout(sw, sh, w, h, clip.zoom ?? 1);
      const panX = Math.max(-1, Math.min(1, clip.panX ?? 0));
      const panY = Math.max(-1, Math.min(1, clip.panY ?? 0));
      const dx = (w - layout.dw) / 2 + panX * layout.overX + tr.dx;
      const dy = (h - layout.dh) / 2 + panY * layout.overY + tr.dy;
      ctx.globalAlpha = 1;
      ctx.drawImage(src, dx, dy, layout.dw, layout.dh);
      ctx.restore();
      ctx.filter = "none";
      applyGradeTints(ctx, fx, w, h);
      applyOverlays(ctx, fx, w, h, { t, local, progress, grainPattern: this.grainPattern, scratch: work?.scratch ?? this.scratch });
    }
  }
  drawTextClip(ctx, clip, t, w, h) {
    if (!clip.text)
      return;
    drawTextOverlay(ctx, w, h, clip.text, t - clip.start, t, clip.duration);
  }
  renderFrame(t) {
    this.composeFrame(this.ctx, t, false);
  }
  composeFrame(ctx, t, noSync, rs, work) {
    if (!ctx)
      return;
    const stStore = useEditor.getState();
    const st = rs ? { ...stStore, clips: rs.clips, tracks: rs.tracks, assets: rs.assets, textPreview: false, exportState: stStore.exportState } : stStore;
    const w = rs ? rs.project.width : this.canvas?.width || stStore.project.width;
    const h = rs ? rs.project.height : this.canvas?.height || stStore.project.height;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    const clips = st.clips;
    if (!clips.length) {
      this.drawBrand(ctx, w, h);
      return;
    }
    const total = totalDuration(clips);
    const tt = t >= total && total > 0 ? Math.max(0, total - 0.001) : t;
    for (const track of st.tracks) {
      if (track.kind === "audio") {
        if (noSync)
          continue;
        for (const c of clips) {
          if (c.trackId !== track.id)
            continue;
          if (tt < c.start || tt >= c.start + c.duration)
            continue;
          const asset = st.assets.find((a) => a.id === c.assetId);
          if (asset?.musicId)
            this.syncMusic(c, track, tt, this.playing);
          else
            this.syncAudioEl(c, track, tt, this.playing);
        }
        continue;
      }
      if (track.hidden)
        continue;
      const active = [...clips].filter((c) => c.trackId === track.id && c.start <= tt && tt < c.start + c.duration).sort((a, b) => a.start - b.start).pop();
      if (!active)
        continue;
      if (track.kind === "text") {
        const actives = clips.filter((c) => c.trackId === track.id && c.start <= tt && tt < c.start + c.duration).sort((a, b) => a.start - b.start);
        for (const tc of actives)
          this.drawMediaFrame(ctx, tc, tt, w, h, noSync, rs, work);
        continue;
      }
      let donor = null;
      let transP = 0;
      if (active.transition && active.start > 0.001) {
        const dur = Math.max(0.1, active.transition.duration);
        const localT = tt - active.start;
        if (localT < dur) {
          donor = clips.find((c) => c.trackId === track.id && c.id !== active.id && Math.abs(c.start + c.duration - active.start) < 0.06) ?? null;
          if (donor)
            transP = clamp(localT / dur, 0, 1);
        }
      }
      if (donor) {
        const tmpA = work?.tmpA ?? this.tmpA;
        const tmpB = work?.tmpB ?? this.tmpB;
        tmpA.width = w;
        tmpA.height = h;
        tmpB.width = w;
        tmpB.height = h;
        const aCtx = tmpA.getContext("2d");
        const bCtx = tmpB.getContext("2d");
        if (aCtx && bCtx) {
          aCtx.fillStyle = "#000";
          aCtx.fillRect(0, 0, w, h);
          bCtx.fillStyle = "#000";
          bCtx.fillRect(0, 0, w, h);
          this.drawMediaFrame(aCtx, donor, tt, w, h, noSync, rs, work);
          this.drawMediaFrame(bCtx, active, tt, w, h, noSync, rs, work);
          applyTransition(active.transition.type, ctx, tmpA, tmpB, transP, w, h, {
            scratch: work?.scratch ?? this.scratch,
            noise: this.tvNoise,
            accent: "#22d3ee"
          });
        }
      } else {
        this.drawMediaFrame(ctx, active, tt, w, h, noSync, rs, work);
      }
    }
    if (st.textPreview && !st.exportState.running && !noSync) {
      this.drawAutoTextPreview(ctx, w, h, tt);
    }
  }
  drawAutoTextPreview(ctx, w, h, t) {
    const st = useEditor.getState();
    const texts = st.texts;
    const fontAuto = texts.fontAuto || "condensed";
    const rel = (v, def) => typeof v === "number" && isFinite(v) && v > 0 ? Math.max(0.012, Math.min(0.2, v)) : def;
    const pct = (v) => clampOff(typeof v === "number" && isFinite(v) ? v / 100 : 0);
    const hasTitle = !!(texts.title && texts.title.trim());
    const hasDesc = !!(texts.description && texts.description.trim());
    const titleOn = st.exportSettings.showTitleText || st.playlistExport.titleDuringVideo || st.playlistExport.showTitleScreen;
    const partOn = st.exportSettings.autoPartText || st.playlistExport.showPartText;
    if ((hasTitle || hasDesc) && titleOn) {
      drawTextOverlay(ctx, w, h, {
        content: texts.title || "",
        sub: hasDesc ? texts.description : undefined,
        size: rel(texts.titleSize, 0.042),
        subSize: rel(texts.descSize, 0.026),
        color: "#ffffff",
        font: fontAuto,
        subFont: fontAuto,
        anim: "rise",
        pos: "top",
        bg: "none",
        stroke: true,
        offX: pct(texts.titleX),
        offY: pct(texts.titleY),
        subOffX: pct(texts.descX),
        subOffY: pct(texts.descY),
        posV: (typeof texts.titleV === "number" ? texts.titleV : 100) / 100,
        frame: texts.titleFrame || undefined,
        frameW: texts.titleFrameW,
        frameH: texts.titleFrameH
      }, 10, t, 12);
    }
    if (partOn) {
      const n = Math.max(1, texts.parts || 1);
      drawTextOverlay(ctx, w, h, {
        content: partLabel(texts.labelStyle || "Part", n, n, true),
        size: rel(texts.partSize, 0.052),
        color: "#ffffff",
        font: fontAuto,
        anim: "slam",
        pos: "bottom",
        bg: "bar",
        stroke: true,
        offX: pct(texts.partX),
        offY: pct(texts.partY),
        posV: (typeof texts.partV === "number" ? texts.partV : 0) / 100
      }, 10, t, 12);
    }
  }
  drawBrand(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#05060f");
    g.addColorStop(0.5, "#0b1030");
    g.addColorStop(1, "#12042a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#22d3ee";
    ctx.shadowBlur = 40;
    ctx.fillStyle = "#eafcff";
    ctx.font = `900 ${h * 0.13}px ${fontStack("display")}`;
    ctx.fillText("NOVACUT", w / 2, h * 0.44);
    ctx.shadowBlur = 0;
    ctx.font = `600 ${h * 0.038}px ${fontStack("sans")}`;
    ctx.fillStyle = "#67e8f9";
    ctx.fillText("Impor media dari panel kiri untuk mulai mengedit", w / 2, h * 0.56);
    ctx.restore();
  }
  play(opts) {
    this.ensureAudio();
    this.stopAt = opts?.stopAt ?? null;
    this.onDone = opts?.onDone ?? null;
    const st = useEditor.getState();
    const end = this.stopAt ?? totalDuration(st.clips);
    if (st.playhead >= end - 0.02)
      st.setPlayhead(0);
    this.session++;
    this.playing = true;
    st.setPlaying(true);
    this.lastTs = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.loop);
  }
  loop = (ts) => {
    if (!this.playing)
      return;
    const dt = Math.min(0.2, (ts - this.lastTs) / 1000);
    this.lastTs = ts;
    const st = useEditor.getState();
    const end = this.stopAt ?? totalDuration(st.clips);
    let t = st.playhead + dt;
    if (t >= end) {
      t = end;
      st.setPlayhead(t);
      this.renderFrame(t);
      this.pause();
      const cb = this.onDone;
      this.onDone = null;
      this.stopAt = null;
      if (cb)
        setTimeout(cb, 120);
      return;
    }
    st.setPlayhead(t);
    this.renderFrame(t);
    this.raf = requestAnimationFrame(this.loop);
  };
  pause() {
    this.playing = false;
    cancelAnimationFrame(this.raf);
    useEditor.getState().setPlaying(false);
    for (const [, el] of this.els) {
      if (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement)
        el.pause();
    }
    for (const id of [...this.musicSessions.keys()])
      this.stopMusicSession(id);
    this.session++;
    this.requestRender();
  }
  toggle() {
    if (this.playing)
      this.pause();
    else
      this.play();
  }
  seek(t) {
    const st = useEditor.getState();
    const end = Math.max(0.001, totalDuration(st.clips));
    const tt = clamp(t, 0, end);
    st.setPlayhead(tt);
    if (this.playing)
      this.session++;
    this.renderFrame(tt);
  }
  async prepareUpcoming(windowSec = 12) {
    const st = useEditor.getState();
    const t = st.playhead;
    const jobs = [];
    for (const clip of st.clips) {
      if (clip.kind !== "video" && clip.kind !== "audio")
        continue;
      const active = clip.start <= t + 0.02 && t < clip.start + clip.duration;
      const upcoming = clip.start > t + 0.02 && clip.start <= t + windowSec;
      if (!active && !upcoming)
        continue;
      const el = this.elFor(clip);
      if (!el || !(el instanceof HTMLVideoElement || el instanceof HTMLAudioElement))
        continue;
      const local = active ? t - clip.start : 0;
      const srcSeg = clip.duration * clip.speed / Math.max(1, clip.loopCount);
      const srcTime = clip.kind === "video" ? clip.inPoint + local * clip.speed % Math.max(0.033, srcSeg) : clip.inPoint + local * clip.speed;
      const target = Math.max(0, Math.min(srcTime, (el.duration || srcTime) - 0.02));
      if (el.readyState >= 2 && el.paused && Math.abs(el.currentTime - target) < 0.08)
        continue;
      jobs.push(new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (done)
            return;
          done = true;
          el.removeEventListener("seeked", finish);
          resolve();
        };
        el.addEventListener("seeked", finish);
        try {
          el.currentTime = target;
        } catch {
          finish();
          return;
        }
        window.setTimeout(finish, 1800);
      }));
    }
    if (!jobs.length)
      return;
    await Promise.race([Promise.all(jobs), sleep(2300)]);
    await sleep(80);
  }
  pruneElements(keep) {
    for (const [key, el] of [...this.els]) {
      if (keep?.has(key))
        continue;
      this.els.delete(key);
      if (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement) {
        try {
          el.pause();
        } catch {}
        try {
          el.removeAttribute("src");
          el.load();
        } catch {}
      }
    }
    for (const key of [...this.mediaSrcs.keys()]) {
      if (!keep?.has(key))
        this.mediaSrcs.delete(key);
    }
  }
  async previewMusic(musicId) {
    this.ensureAudio();
    this.stopPreview();
    const def = musicDefById(musicId);
    if (!def || !this.audioCtx)
      return;
    const buf = await getMusicBuffer(def);
    if (!this.audioCtx)
      return;
    const src = this.audioCtx.createBufferSource();
    src.buffer = buf;
    const g = this.audioCtx.createGain();
    g.gain.value = 0.85;
    src.connect(g).connect(this.audioCtx.destination);
    src.start();
    this.previewSource = src;
  }
  stopPreview() {
    if (this.previewSource) {
      try {
        this.previewSource.stop();
      } catch {}
      this.previewSource = null;
    }
  }
  captureStream(fps = 30) {
    if (!this.canvas || typeof this.canvas.captureStream !== "function")
      return null;
    return this.canvas.captureStream(fps);
  }
}
var engine = new EditorEngine;
if (typeof window !== "undefined") {
  window.addEventListener("novacut:fonts-ready", () => engine.requestRender());
}

// scripts/titleframe-test/engine-entry.ts
window.NovaDraw = { drawTextOverlay };
