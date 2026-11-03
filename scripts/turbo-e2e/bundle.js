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

// node_modules/mp4-muxer/build/mp4-muxer.mjs
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var bytes = new Uint8Array(8);
var view = new DataView(bytes.buffer);
var u8 = (value) => {
  return [(value % 256 + 256) % 256];
};
var u16 = (value) => {
  view.setUint16(0, value, false);
  return [bytes[0], bytes[1]];
};
var i16 = (value) => {
  view.setInt16(0, value, false);
  return [bytes[0], bytes[1]];
};
var u24 = (value) => {
  view.setUint32(0, value, false);
  return [bytes[1], bytes[2], bytes[3]];
};
var u32 = (value) => {
  view.setUint32(0, value, false);
  return [bytes[0], bytes[1], bytes[2], bytes[3]];
};
var i32 = (value) => {
  view.setInt32(0, value, false);
  return [bytes[0], bytes[1], bytes[2], bytes[3]];
};
var u64 = (value) => {
  view.setUint32(0, Math.floor(value / 2 ** 32), false);
  view.setUint32(4, value, false);
  return [bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]];
};
var fixed_8_8 = (value) => {
  view.setInt16(0, 2 ** 8 * value, false);
  return [bytes[0], bytes[1]];
};
var fixed_16_16 = (value) => {
  view.setInt32(0, 2 ** 16 * value, false);
  return [bytes[0], bytes[1], bytes[2], bytes[3]];
};
var fixed_2_30 = (value) => {
  view.setInt32(0, 2 ** 30 * value, false);
  return [bytes[0], bytes[1], bytes[2], bytes[3]];
};
var ascii = (text, nullTerminated = false) => {
  let bytes2 = Array(text.length).fill(null).map((_, i) => text.charCodeAt(i));
  if (nullTerminated)
    bytes2.push(0);
  return bytes2;
};
var last = (arr) => {
  return arr && arr[arr.length - 1];
};
var lastPresentedSample = (samples) => {
  let result = undefined;
  for (let sample of samples) {
    if (!result || sample.presentationTimestamp > result.presentationTimestamp) {
      result = sample;
    }
  }
  return result;
};
var intoTimescale = (timeInSeconds, timescale, round = true) => {
  let value = timeInSeconds * timescale;
  return round ? Math.round(value) : value;
};
var rotationMatrix = (rotationInDegrees) => {
  let theta = rotationInDegrees * (Math.PI / 180);
  let cosTheta = Math.cos(theta);
  let sinTheta = Math.sin(theta);
  return [
    cosTheta,
    sinTheta,
    0,
    -sinTheta,
    cosTheta,
    0,
    0,
    0,
    1
  ];
};
var IDENTITY_MATRIX = rotationMatrix(0);
var matrixToBytes = (matrix) => {
  return [
    fixed_16_16(matrix[0]),
    fixed_16_16(matrix[1]),
    fixed_2_30(matrix[2]),
    fixed_16_16(matrix[3]),
    fixed_16_16(matrix[4]),
    fixed_2_30(matrix[5]),
    fixed_16_16(matrix[6]),
    fixed_16_16(matrix[7]),
    fixed_2_30(matrix[8])
  ];
};
var deepClone = (x) => {
  if (!x)
    return x;
  if (typeof x !== "object")
    return x;
  if (Array.isArray(x))
    return x.map(deepClone);
  return Object.fromEntries(Object.entries(x).map(([key, value]) => [key, deepClone(value)]));
};
var isU32 = (value) => {
  return value >= 0 && value < 2 ** 32;
};
var box = (type, contents, children) => ({
  type,
  contents: contents && new Uint8Array(contents.flat(10)),
  children
});
var fullBox = (type, version, flags, contents, children) => box(type, [u8(version), u24(flags), contents ?? []], children);
var ftyp = (details) => {
  let minorVersion = 512;
  if (details.fragmented)
    return box("ftyp", [
      ascii("iso5"),
      u32(minorVersion),
      ascii("iso5"),
      ascii("iso6"),
      ascii("mp41")
    ]);
  return box("ftyp", [
    ascii("isom"),
    u32(minorVersion),
    ascii("isom"),
    details.holdsAvc ? ascii("avc1") : [],
    ascii("mp41")
  ]);
};
var mdat = (reserveLargeSize) => ({ type: "mdat", largeSize: reserveLargeSize });
var free = (size) => ({ type: "free", size });
var moov = (tracks, creationTime, fragmented = false) => box("moov", null, [
  mvhd(creationTime, tracks),
  ...tracks.map((x) => trak(x, creationTime)),
  fragmented ? mvex(tracks) : null
]);
var mvhd = (creationTime, tracks) => {
  let duration = intoTimescale(Math.max(0, ...tracks.filter((x) => x.samples.length > 0).map((x) => {
    const lastSample = lastPresentedSample(x.samples);
    return lastSample.presentationTimestamp + lastSample.duration;
  })), GLOBAL_TIMESCALE);
  let nextTrackId = Math.max(...tracks.map((x) => x.id)) + 1;
  let needsU64 = !isU32(creationTime) || !isU32(duration);
  let u32OrU64 = needsU64 ? u64 : u32;
  return fullBox("mvhd", +needsU64, 0, [
    u32OrU64(creationTime),
    u32OrU64(creationTime),
    u32(GLOBAL_TIMESCALE),
    u32OrU64(duration),
    fixed_16_16(1),
    fixed_8_8(1),
    Array(10).fill(0),
    matrixToBytes(IDENTITY_MATRIX),
    Array(24).fill(0),
    u32(nextTrackId)
  ]);
};
var trak = (track, creationTime) => box("trak", null, [
  tkhd(track, creationTime),
  mdia(track, creationTime)
]);
var tkhd = (track, creationTime) => {
  let lastSample = lastPresentedSample(track.samples);
  let durationInGlobalTimescale = intoTimescale(lastSample ? lastSample.presentationTimestamp + lastSample.duration : 0, GLOBAL_TIMESCALE);
  let needsU64 = !isU32(creationTime) || !isU32(durationInGlobalTimescale);
  let u32OrU64 = needsU64 ? u64 : u32;
  let matrix;
  if (track.info.type === "video") {
    matrix = typeof track.info.rotation === "number" ? rotationMatrix(track.info.rotation) : track.info.rotation;
  } else {
    matrix = IDENTITY_MATRIX;
  }
  return fullBox("tkhd", +needsU64, 3, [
    u32OrU64(creationTime),
    u32OrU64(creationTime),
    u32(track.id),
    u32(0),
    u32OrU64(durationInGlobalTimescale),
    Array(8).fill(0),
    u16(0),
    u16(0),
    fixed_8_8(track.info.type === "audio" ? 1 : 0),
    u16(0),
    matrixToBytes(matrix),
    fixed_16_16(track.info.type === "video" ? track.info.width : 0),
    fixed_16_16(track.info.type === "video" ? track.info.height : 0)
  ]);
};
var mdia = (track, creationTime) => box("mdia", null, [
  mdhd(track, creationTime),
  hdlr(track.info.type === "video" ? "vide" : "soun"),
  minf(track)
]);
var mdhd = (track, creationTime) => {
  let lastSample = lastPresentedSample(track.samples);
  let localDuration = intoTimescale(lastSample ? lastSample.presentationTimestamp + lastSample.duration : 0, track.timescale);
  let needsU64 = !isU32(creationTime) || !isU32(localDuration);
  let u32OrU64 = needsU64 ? u64 : u32;
  return fullBox("mdhd", +needsU64, 0, [
    u32OrU64(creationTime),
    u32OrU64(creationTime),
    u32(track.timescale),
    u32OrU64(localDuration),
    u16(21956),
    u16(0)
  ]);
};
var hdlr = (componentSubtype) => fullBox("hdlr", 0, 0, [
  ascii("mhlr"),
  ascii(componentSubtype),
  u32(0),
  u32(0),
  u32(0),
  ascii("mp4-muxer-hdlr", true)
]);
var minf = (track) => box("minf", null, [
  track.info.type === "video" ? vmhd() : smhd(),
  dinf(),
  stbl(track)
]);
var vmhd = () => fullBox("vmhd", 0, 1, [
  u16(0),
  u16(0),
  u16(0),
  u16(0)
]);
var smhd = () => fullBox("smhd", 0, 0, [
  u16(0),
  u16(0)
]);
var dinf = () => box("dinf", null, [
  dref()
]);
var dref = () => fullBox("dref", 0, 0, [
  u32(1)
], [
  url()
]);
var url = () => fullBox("url ", 0, 1);
var stbl = (track) => {
  const needsCtts = track.compositionTimeOffsetTable.length > 1 || track.compositionTimeOffsetTable.some((x) => x.sampleCompositionTimeOffset !== 0);
  return box("stbl", null, [
    stsd(track),
    stts(track),
    stss(track),
    stsc(track),
    stsz(track),
    stco(track),
    needsCtts ? ctts(track) : null
  ]);
};
var stsd = (track) => fullBox("stsd", 0, 0, [
  u32(1)
], [
  track.info.type === "video" ? videoSampleDescription(VIDEO_CODEC_TO_BOX_NAME[track.info.codec], track) : soundSampleDescription(AUDIO_CODEC_TO_BOX_NAME[track.info.codec], track)
]);
var videoSampleDescription = (compressionType, track) => box(compressionType, [
  Array(6).fill(0),
  u16(1),
  u16(0),
  u16(0),
  Array(12).fill(0),
  u16(track.info.width),
  u16(track.info.height),
  u32(4718592),
  u32(4718592),
  u32(0),
  u16(1),
  Array(32).fill(0),
  u16(24),
  i16(65535)
], [
  VIDEO_CODEC_TO_CONFIGURATION_BOX[track.info.codec](track),
  track.info.decoderConfig.colorSpace ? colr(track) : null
]);
var COLOR_PRIMARIES_MAP = {
  bt709: 1,
  bt470bg: 5,
  smpte170m: 6
};
var TRANSFER_CHARACTERISTICS_MAP = {
  bt709: 1,
  smpte170m: 6,
  "iec61966-2-1": 13
};
var MATRIX_COEFFICIENTS_MAP = {
  rgb: 0,
  bt709: 1,
  bt470bg: 5,
  smpte170m: 6
};
var colr = (track) => box("colr", [
  ascii("nclx"),
  u16(COLOR_PRIMARIES_MAP[track.info.decoderConfig.colorSpace.primaries]),
  u16(TRANSFER_CHARACTERISTICS_MAP[track.info.decoderConfig.colorSpace.transfer]),
  u16(MATRIX_COEFFICIENTS_MAP[track.info.decoderConfig.colorSpace.matrix]),
  u8((track.info.decoderConfig.colorSpace.fullRange ? 1 : 0) << 7)
]);
var avcC = (track) => track.info.decoderConfig && box("avcC", [
  ...new Uint8Array(track.info.decoderConfig.description)
]);
var hvcC = (track) => track.info.decoderConfig && box("hvcC", [
  ...new Uint8Array(track.info.decoderConfig.description)
]);
var vpcC = (track) => {
  if (!track.info.decoderConfig) {
    return null;
  }
  let decoderConfig = track.info.decoderConfig;
  if (!decoderConfig.colorSpace) {
    throw new Error(`'colorSpace' is required in the decoder config for VP9.`);
  }
  let parts = decoderConfig.codec.split(".");
  let profile = Number(parts[1]);
  let level = Number(parts[2]);
  let bitDepth = Number(parts[3]);
  let chromaSubsampling = 0;
  let thirdByte = (bitDepth << 4) + (chromaSubsampling << 1) + Number(decoderConfig.colorSpace.fullRange);
  let colourPrimaries = 2;
  let transferCharacteristics = 2;
  let matrixCoefficients = 2;
  return fullBox("vpcC", 1, 0, [
    u8(profile),
    u8(level),
    u8(thirdByte),
    u8(colourPrimaries),
    u8(transferCharacteristics),
    u8(matrixCoefficients),
    u16(0)
  ]);
};
var av1C = () => {
  let marker = 1;
  let version = 1;
  let firstByte = (marker << 7) + version;
  return box("av1C", [
    firstByte,
    0,
    0,
    0
  ]);
};
var soundSampleDescription = (compressionType, track) => box(compressionType, [
  Array(6).fill(0),
  u16(1),
  u16(0),
  u16(0),
  u32(0),
  u16(track.info.numberOfChannels),
  u16(16),
  u16(0),
  u16(0),
  fixed_16_16(track.info.sampleRate)
], [
  AUDIO_CODEC_TO_CONFIGURATION_BOX[track.info.codec](track)
]);
var esds = (track) => {
  let description = new Uint8Array(track.info.decoderConfig.description);
  return fullBox("esds", 0, 0, [
    u32(58753152),
    u8(32 + description.byteLength),
    u16(1),
    u8(0),
    u32(75530368),
    u8(18 + description.byteLength),
    u8(64),
    u8(21),
    u24(0),
    u32(130071),
    u32(130071),
    u32(92307584),
    u8(description.byteLength),
    ...description,
    u32(109084800),
    u8(1),
    u8(2)
  ]);
};
var dOps = (track) => {
  let preskip = 3840;
  let gain = 0;
  const description = track.info.decoderConfig?.description;
  if (description) {
    if (description.byteLength < 18) {
      throw new TypeError("Invalid decoder description provided for Opus; must be at least 18 bytes long.");
    }
    const view2 = ArrayBuffer.isView(description) ? new DataView(description.buffer, description.byteOffset, description.byteLength) : new DataView(description);
    preskip = view2.getUint16(10, true);
    gain = view2.getInt16(14, true);
  }
  return box("dOps", [
    u8(0),
    u8(track.info.numberOfChannels),
    u16(preskip),
    u32(track.info.sampleRate),
    fixed_8_8(gain),
    u8(0)
  ]);
};
var stts = (track) => {
  return fullBox("stts", 0, 0, [
    u32(track.timeToSampleTable.length),
    track.timeToSampleTable.map((x) => [
      u32(x.sampleCount),
      u32(x.sampleDelta)
    ])
  ]);
};
var stss = (track) => {
  if (track.samples.every((x) => x.type === "key"))
    return null;
  let keySamples = [...track.samples.entries()].filter(([, sample]) => sample.type === "key");
  return fullBox("stss", 0, 0, [
    u32(keySamples.length),
    keySamples.map(([index]) => u32(index + 1))
  ]);
};
var stsc = (track) => {
  return fullBox("stsc", 0, 0, [
    u32(track.compactlyCodedChunkTable.length),
    track.compactlyCodedChunkTable.map((x) => [
      u32(x.firstChunk),
      u32(x.samplesPerChunk),
      u32(1)
    ])
  ]);
};
var stsz = (track) => fullBox("stsz", 0, 0, [
  u32(0),
  u32(track.samples.length),
  track.samples.map((x) => u32(x.size))
]);
var stco = (track) => {
  if (track.finalizedChunks.length > 0 && last(track.finalizedChunks).offset >= 2 ** 32) {
    return fullBox("co64", 0, 0, [
      u32(track.finalizedChunks.length),
      track.finalizedChunks.map((x) => u64(x.offset))
    ]);
  }
  return fullBox("stco", 0, 0, [
    u32(track.finalizedChunks.length),
    track.finalizedChunks.map((x) => u32(x.offset))
  ]);
};
var ctts = (track) => {
  return fullBox("ctts", 0, 0, [
    u32(track.compositionTimeOffsetTable.length),
    track.compositionTimeOffsetTable.map((x) => [
      u32(x.sampleCount),
      u32(x.sampleCompositionTimeOffset)
    ])
  ]);
};
var mvex = (tracks) => {
  return box("mvex", null, tracks.map(trex));
};
var trex = (track) => {
  return fullBox("trex", 0, 0, [
    u32(track.id),
    u32(1),
    u32(0),
    u32(0),
    u32(0)
  ]);
};
var moof = (sequenceNumber, tracks) => {
  return box("moof", null, [
    mfhd(sequenceNumber),
    ...tracks.map(traf)
  ]);
};
var mfhd = (sequenceNumber) => {
  return fullBox("mfhd", 0, 0, [
    u32(sequenceNumber)
  ]);
};
var fragmentSampleFlags = (sample) => {
  let byte1 = 0;
  let byte2 = 0;
  let byte3 = 0;
  let byte4 = 0;
  let sampleIsDifferenceSample = sample.type === "delta";
  byte2 |= +sampleIsDifferenceSample;
  if (sampleIsDifferenceSample) {
    byte1 |= 1;
  } else {
    byte1 |= 2;
  }
  return byte1 << 24 | byte2 << 16 | byte3 << 8 | byte4;
};
var traf = (track) => {
  return box("traf", null, [
    tfhd(track),
    tfdt(track),
    trun(track)
  ]);
};
var tfhd = (track) => {
  let tfFlags = 0;
  tfFlags |= 8;
  tfFlags |= 16;
  tfFlags |= 32;
  tfFlags |= 131072;
  let referenceSample = track.currentChunk.samples[1] ?? track.currentChunk.samples[0];
  let referenceSampleInfo = {
    duration: referenceSample.timescaleUnitsToNextSample,
    size: referenceSample.size,
    flags: fragmentSampleFlags(referenceSample)
  };
  return fullBox("tfhd", 0, tfFlags, [
    u32(track.id),
    u32(referenceSampleInfo.duration),
    u32(referenceSampleInfo.size),
    u32(referenceSampleInfo.flags)
  ]);
};
var tfdt = (track) => {
  return fullBox("tfdt", 1, 0, [
    u64(intoTimescale(track.currentChunk.startTimestamp, track.timescale))
  ]);
};
var trun = (track) => {
  let allSampleDurations = track.currentChunk.samples.map((x) => x.timescaleUnitsToNextSample);
  let allSampleSizes = track.currentChunk.samples.map((x) => x.size);
  let allSampleFlags = track.currentChunk.samples.map(fragmentSampleFlags);
  let allSampleCompositionTimeOffsets = track.currentChunk.samples.map((x) => intoTimescale(x.presentationTimestamp - x.decodeTimestamp, track.timescale));
  let uniqueSampleDurations = new Set(allSampleDurations);
  let uniqueSampleSizes = new Set(allSampleSizes);
  let uniqueSampleFlags = new Set(allSampleFlags);
  let uniqueSampleCompositionTimeOffsets = new Set(allSampleCompositionTimeOffsets);
  let firstSampleFlagsPresent = uniqueSampleFlags.size === 2 && allSampleFlags[0] !== allSampleFlags[1];
  let sampleDurationPresent = uniqueSampleDurations.size > 1;
  let sampleSizePresent = uniqueSampleSizes.size > 1;
  let sampleFlagsPresent = !firstSampleFlagsPresent && uniqueSampleFlags.size > 1;
  let sampleCompositionTimeOffsetsPresent = uniqueSampleCompositionTimeOffsets.size > 1 || [...uniqueSampleCompositionTimeOffsets].some((x) => x !== 0);
  let flags = 0;
  flags |= 1;
  flags |= 4 * +firstSampleFlagsPresent;
  flags |= 256 * +sampleDurationPresent;
  flags |= 512 * +sampleSizePresent;
  flags |= 1024 * +sampleFlagsPresent;
  flags |= 2048 * +sampleCompositionTimeOffsetsPresent;
  return fullBox("trun", 1, flags, [
    u32(track.currentChunk.samples.length),
    u32(track.currentChunk.offset - track.currentChunk.moofOffset || 0),
    firstSampleFlagsPresent ? u32(allSampleFlags[0]) : [],
    track.currentChunk.samples.map((_, i) => [
      sampleDurationPresent ? u32(allSampleDurations[i]) : [],
      sampleSizePresent ? u32(allSampleSizes[i]) : [],
      sampleFlagsPresent ? u32(allSampleFlags[i]) : [],
      sampleCompositionTimeOffsetsPresent ? i32(allSampleCompositionTimeOffsets[i]) : []
    ])
  ]);
};
var mfra = (tracks) => {
  return box("mfra", null, [
    ...tracks.map(tfra),
    mfro()
  ]);
};
var tfra = (track, trackIndex) => {
  let version = 1;
  return fullBox("tfra", version, 0, [
    u32(track.id),
    u32(63),
    u32(track.finalizedChunks.length),
    track.finalizedChunks.map((chunk) => [
      u64(intoTimescale(chunk.startTimestamp, track.timescale)),
      u64(chunk.moofOffset),
      u32(trackIndex + 1),
      u32(1),
      u32(1)
    ])
  ]);
};
var mfro = () => {
  return fullBox("mfro", 0, 0, [
    u32(0)
  ]);
};
var VIDEO_CODEC_TO_BOX_NAME = {
  avc: "avc1",
  hevc: "hvc1",
  vp9: "vp09",
  av1: "av01"
};
var VIDEO_CODEC_TO_CONFIGURATION_BOX = {
  avc: avcC,
  hevc: hvcC,
  vp9: vpcC,
  av1: av1C
};
var AUDIO_CODEC_TO_BOX_NAME = {
  aac: "mp4a",
  opus: "Opus"
};
var AUDIO_CODEC_TO_CONFIGURATION_BOX = {
  aac: esds,
  opus: dOps
};
var isTarget = Symbol("isTarget");
var Target = class {
};
var ArrayBufferTarget = class extends Target {
  constructor() {
    super(...arguments);
    this.buffer = null;
  }
};
var StreamTarget = class extends Target {
  constructor(options) {
    super();
    this.options = options;
    if (typeof options !== "object") {
      throw new TypeError("StreamTarget requires an options object to be passed to its constructor.");
    }
    if (options.onData) {
      if (typeof options.onData !== "function") {
        throw new TypeError("options.onData, when provided, must be a function.");
      }
      if (options.onData.length < 2) {
        throw new TypeError("options.onData, when provided, must be a function that takes in at least two arguments (data and position). Ignoring the position argument, which specifies the byte offset at which the data is to be written, can lead to broken outputs.");
      }
    }
    if (options.chunked !== undefined && typeof options.chunked !== "boolean") {
      throw new TypeError("options.chunked, when provided, must be a boolean.");
    }
    if (options.chunkSize !== undefined && (!Number.isInteger(options.chunkSize) || options.chunkSize < 1024)) {
      throw new TypeError("options.chunkSize, when provided, must be an integer and not smaller than 1024.");
    }
  }
};
var FileSystemWritableFileStreamTarget = class extends Target {
  constructor(stream, options) {
    super();
    this.stream = stream;
    this.options = options;
    if (!(stream instanceof FileSystemWritableFileStream)) {
      throw new TypeError("FileSystemWritableFileStreamTarget requires a FileSystemWritableFileStream instance.");
    }
    if (options !== undefined && typeof options !== "object") {
      throw new TypeError("FileSystemWritableFileStreamTarget's options, when provided, must be an object.");
    }
    if (options) {
      if (options.chunkSize !== undefined && (!Number.isInteger(options.chunkSize) || options.chunkSize <= 0)) {
        throw new TypeError("options.chunkSize, when provided, must be a positive integer");
      }
    }
  }
};
var _helper;
var _helperView;
var Writer = class {
  constructor() {
    this.pos = 0;
    __privateAdd(this, _helper, new Uint8Array(8));
    __privateAdd(this, _helperView, new DataView(__privateGet(this, _helper).buffer));
    this.offsets = /* @__PURE__ */ new WeakMap;
  }
  seek(newPos) {
    this.pos = newPos;
  }
  writeU32(value) {
    __privateGet(this, _helperView).setUint32(0, value, false);
    this.write(__privateGet(this, _helper).subarray(0, 4));
  }
  writeU64(value) {
    __privateGet(this, _helperView).setUint32(0, Math.floor(value / 2 ** 32), false);
    __privateGet(this, _helperView).setUint32(4, value, false);
    this.write(__privateGet(this, _helper).subarray(0, 8));
  }
  writeAscii(text) {
    for (let i = 0;i < text.length; i++) {
      __privateGet(this, _helperView).setUint8(i % 8, text.charCodeAt(i));
      if (i % 8 === 7)
        this.write(__privateGet(this, _helper));
    }
    if (text.length % 8 !== 0) {
      this.write(__privateGet(this, _helper).subarray(0, text.length % 8));
    }
  }
  writeBox(box2) {
    this.offsets.set(box2, this.pos);
    if (box2.contents && !box2.children) {
      this.writeBoxHeader(box2, box2.size ?? box2.contents.byteLength + 8);
      this.write(box2.contents);
    } else {
      let startPos = this.pos;
      this.writeBoxHeader(box2, 0);
      if (box2.contents)
        this.write(box2.contents);
      if (box2.children) {
        for (let child of box2.children)
          if (child)
            this.writeBox(child);
      }
      let endPos = this.pos;
      let size = box2.size ?? endPos - startPos;
      this.seek(startPos);
      this.writeBoxHeader(box2, size);
      this.seek(endPos);
    }
  }
  writeBoxHeader(box2, size) {
    this.writeU32(box2.largeSize ? 1 : size);
    this.writeAscii(box2.type);
    if (box2.largeSize)
      this.writeU64(size);
  }
  measureBoxHeader(box2) {
    return 8 + (box2.largeSize ? 8 : 0);
  }
  patchBox(box2) {
    let endPos = this.pos;
    this.seek(this.offsets.get(box2));
    this.writeBox(box2);
    this.seek(endPos);
  }
  measureBox(box2) {
    if (box2.contents && !box2.children) {
      let headerSize = this.measureBoxHeader(box2);
      return headerSize + box2.contents.byteLength;
    } else {
      let result = this.measureBoxHeader(box2);
      if (box2.contents)
        result += box2.contents.byteLength;
      if (box2.children) {
        for (let child of box2.children)
          if (child)
            result += this.measureBox(child);
      }
      return result;
    }
  }
};
_helper = new WeakMap;
_helperView = new WeakMap;
var _target;
var _buffer;
var _bytes;
var _maxPos;
var _ensureSize;
var ensureSize_fn;
var ArrayBufferTargetWriter = class extends Writer {
  constructor(target) {
    super();
    __privateAdd(this, _ensureSize);
    __privateAdd(this, _target, undefined);
    __privateAdd(this, _buffer, new ArrayBuffer(2 ** 16));
    __privateAdd(this, _bytes, new Uint8Array(__privateGet(this, _buffer)));
    __privateAdd(this, _maxPos, 0);
    __privateSet(this, _target, target);
  }
  write(data) {
    __privateMethod(this, _ensureSize, ensureSize_fn).call(this, this.pos + data.byteLength);
    __privateGet(this, _bytes).set(data, this.pos);
    this.pos += data.byteLength;
    __privateSet(this, _maxPos, Math.max(__privateGet(this, _maxPos), this.pos));
  }
  finalize() {
    __privateMethod(this, _ensureSize, ensureSize_fn).call(this, this.pos);
    __privateGet(this, _target).buffer = __privateGet(this, _buffer).slice(0, Math.max(__privateGet(this, _maxPos), this.pos));
  }
};
_target = new WeakMap;
_buffer = new WeakMap;
_bytes = new WeakMap;
_maxPos = new WeakMap;
_ensureSize = new WeakSet;
ensureSize_fn = function(size) {
  let newLength = __privateGet(this, _buffer).byteLength;
  while (newLength < size)
    newLength *= 2;
  if (newLength === __privateGet(this, _buffer).byteLength)
    return;
  let newBuffer = new ArrayBuffer(newLength);
  let newBytes = new Uint8Array(newBuffer);
  newBytes.set(__privateGet(this, _bytes), 0);
  __privateSet(this, _buffer, newBuffer);
  __privateSet(this, _bytes, newBytes);
};
var DEFAULT_CHUNK_SIZE = 2 ** 24;
var MAX_CHUNKS_AT_ONCE = 2;
var _target2;
var _sections;
var _chunked;
var _chunkSize;
var _chunks;
var _writeDataIntoChunks;
var writeDataIntoChunks_fn;
var _insertSectionIntoChunk;
var insertSectionIntoChunk_fn;
var _createChunk;
var createChunk_fn;
var _flushChunks;
var flushChunks_fn;
var StreamTargetWriter = class extends Writer {
  constructor(target) {
    super();
    __privateAdd(this, _writeDataIntoChunks);
    __privateAdd(this, _insertSectionIntoChunk);
    __privateAdd(this, _createChunk);
    __privateAdd(this, _flushChunks);
    __privateAdd(this, _target2, undefined);
    __privateAdd(this, _sections, []);
    __privateAdd(this, _chunked, undefined);
    __privateAdd(this, _chunkSize, undefined);
    __privateAdd(this, _chunks, []);
    __privateSet(this, _target2, target);
    __privateSet(this, _chunked, target.options?.chunked ?? false);
    __privateSet(this, _chunkSize, target.options?.chunkSize ?? DEFAULT_CHUNK_SIZE);
  }
  write(data) {
    __privateGet(this, _sections).push({
      data: data.slice(),
      start: this.pos
    });
    this.pos += data.byteLength;
  }
  flush() {
    if (__privateGet(this, _sections).length === 0)
      return;
    let chunks = [];
    let sorted = [...__privateGet(this, _sections)].sort((a, b) => a.start - b.start);
    chunks.push({
      start: sorted[0].start,
      size: sorted[0].data.byteLength
    });
    for (let i = 1;i < sorted.length; i++) {
      let lastChunk = chunks[chunks.length - 1];
      let section = sorted[i];
      if (section.start <= lastChunk.start + lastChunk.size) {
        lastChunk.size = Math.max(lastChunk.size, section.start + section.data.byteLength - lastChunk.start);
      } else {
        chunks.push({
          start: section.start,
          size: section.data.byteLength
        });
      }
    }
    for (let chunk of chunks) {
      chunk.data = new Uint8Array(chunk.size);
      for (let section of __privateGet(this, _sections)) {
        if (chunk.start <= section.start && section.start < chunk.start + chunk.size) {
          chunk.data.set(section.data, section.start - chunk.start);
        }
      }
      if (__privateGet(this, _chunked)) {
        __privateMethod(this, _writeDataIntoChunks, writeDataIntoChunks_fn).call(this, chunk.data, chunk.start);
        __privateMethod(this, _flushChunks, flushChunks_fn).call(this);
      } else {
        __privateGet(this, _target2).options.onData?.(chunk.data, chunk.start);
      }
    }
    __privateGet(this, _sections).length = 0;
  }
  finalize() {
    if (__privateGet(this, _chunked)) {
      __privateMethod(this, _flushChunks, flushChunks_fn).call(this, true);
    }
  }
};
_target2 = new WeakMap;
_sections = new WeakMap;
_chunked = new WeakMap;
_chunkSize = new WeakMap;
_chunks = new WeakMap;
_writeDataIntoChunks = new WeakSet;
writeDataIntoChunks_fn = function(data, position) {
  let chunkIndex = __privateGet(this, _chunks).findIndex((x) => x.start <= position && position < x.start + __privateGet(this, _chunkSize));
  if (chunkIndex === -1)
    chunkIndex = __privateMethod(this, _createChunk, createChunk_fn).call(this, position);
  let chunk = __privateGet(this, _chunks)[chunkIndex];
  let relativePosition = position - chunk.start;
  let toWrite = data.subarray(0, Math.min(__privateGet(this, _chunkSize) - relativePosition, data.byteLength));
  chunk.data.set(toWrite, relativePosition);
  let section = {
    start: relativePosition,
    end: relativePosition + toWrite.byteLength
  };
  __privateMethod(this, _insertSectionIntoChunk, insertSectionIntoChunk_fn).call(this, chunk, section);
  if (chunk.written[0].start === 0 && chunk.written[0].end === __privateGet(this, _chunkSize)) {
    chunk.shouldFlush = true;
  }
  if (__privateGet(this, _chunks).length > MAX_CHUNKS_AT_ONCE) {
    for (let i = 0;i < __privateGet(this, _chunks).length - 1; i++) {
      __privateGet(this, _chunks)[i].shouldFlush = true;
    }
    __privateMethod(this, _flushChunks, flushChunks_fn).call(this);
  }
  if (toWrite.byteLength < data.byteLength) {
    __privateMethod(this, _writeDataIntoChunks, writeDataIntoChunks_fn).call(this, data.subarray(toWrite.byteLength), position + toWrite.byteLength);
  }
};
_insertSectionIntoChunk = new WeakSet;
insertSectionIntoChunk_fn = function(chunk, section) {
  let low = 0;
  let high = chunk.written.length - 1;
  let index = -1;
  while (low <= high) {
    let mid = Math.floor(low + (high - low + 1) / 2);
    if (chunk.written[mid].start <= section.start) {
      low = mid + 1;
      index = mid;
    } else {
      high = mid - 1;
    }
  }
  chunk.written.splice(index + 1, 0, section);
  if (index === -1 || chunk.written[index].end < section.start)
    index++;
  while (index < chunk.written.length - 1 && chunk.written[index].end >= chunk.written[index + 1].start) {
    chunk.written[index].end = Math.max(chunk.written[index].end, chunk.written[index + 1].end);
    chunk.written.splice(index + 1, 1);
  }
};
_createChunk = new WeakSet;
createChunk_fn = function(includesPosition) {
  let start = Math.floor(includesPosition / __privateGet(this, _chunkSize)) * __privateGet(this, _chunkSize);
  let chunk = {
    start,
    data: new Uint8Array(__privateGet(this, _chunkSize)),
    written: [],
    shouldFlush: false
  };
  __privateGet(this, _chunks).push(chunk);
  __privateGet(this, _chunks).sort((a, b) => a.start - b.start);
  return __privateGet(this, _chunks).indexOf(chunk);
};
_flushChunks = new WeakSet;
flushChunks_fn = function(force = false) {
  for (let i = 0;i < __privateGet(this, _chunks).length; i++) {
    let chunk = __privateGet(this, _chunks)[i];
    if (!chunk.shouldFlush && !force)
      continue;
    for (let section of chunk.written) {
      __privateGet(this, _target2).options.onData?.(chunk.data.subarray(section.start, section.end), chunk.start + section.start);
    }
    __privateGet(this, _chunks).splice(i--, 1);
  }
};
var FileSystemWritableFileStreamTargetWriter = class extends StreamTargetWriter {
  constructor(target) {
    super(new StreamTarget({
      onData: (data, position) => target.stream.write({
        type: "write",
        data,
        position
      }),
      chunked: true,
      chunkSize: target.options?.chunkSize
    }));
  }
};
var GLOBAL_TIMESCALE = 1000;
var SUPPORTED_VIDEO_CODECS = ["avc", "hevc", "vp9", "av1"];
var SUPPORTED_AUDIO_CODECS = ["aac", "opus"];
var TIMESTAMP_OFFSET = 2082844800;
var FIRST_TIMESTAMP_BEHAVIORS = ["strict", "offset", "cross-track-offset"];
var _options;
var _writer;
var _ftypSize;
var _mdat;
var _videoTrack;
var _audioTrack;
var _creationTime;
var _finalizedChunks;
var _nextFragmentNumber;
var _videoSampleQueue;
var _audioSampleQueue;
var _finalized;
var _validateOptions;
var validateOptions_fn;
var _writeHeader;
var writeHeader_fn;
var _computeMoovSizeUpperBound;
var computeMoovSizeUpperBound_fn;
var _prepareTracks;
var prepareTracks_fn;
var _generateMpeg4AudioSpecificConfig;
var generateMpeg4AudioSpecificConfig_fn;
var _createSampleForTrack;
var createSampleForTrack_fn;
var _addSampleToTrack;
var addSampleToTrack_fn;
var _validateTimestamp;
var validateTimestamp_fn;
var _finalizeCurrentChunk;
var finalizeCurrentChunk_fn;
var _finalizeFragment;
var finalizeFragment_fn;
var _maybeFlushStreamingTargetWriter;
var maybeFlushStreamingTargetWriter_fn;
var _ensureNotFinalized;
var ensureNotFinalized_fn;
var Muxer = class {
  constructor(options) {
    __privateAdd(this, _validateOptions);
    __privateAdd(this, _writeHeader);
    __privateAdd(this, _computeMoovSizeUpperBound);
    __privateAdd(this, _prepareTracks);
    __privateAdd(this, _generateMpeg4AudioSpecificConfig);
    __privateAdd(this, _createSampleForTrack);
    __privateAdd(this, _addSampleToTrack);
    __privateAdd(this, _validateTimestamp);
    __privateAdd(this, _finalizeCurrentChunk);
    __privateAdd(this, _finalizeFragment);
    __privateAdd(this, _maybeFlushStreamingTargetWriter);
    __privateAdd(this, _ensureNotFinalized);
    __privateAdd(this, _options, undefined);
    __privateAdd(this, _writer, undefined);
    __privateAdd(this, _ftypSize, undefined);
    __privateAdd(this, _mdat, undefined);
    __privateAdd(this, _videoTrack, null);
    __privateAdd(this, _audioTrack, null);
    __privateAdd(this, _creationTime, Math.floor(Date.now() / 1000) + TIMESTAMP_OFFSET);
    __privateAdd(this, _finalizedChunks, []);
    __privateAdd(this, _nextFragmentNumber, 1);
    __privateAdd(this, _videoSampleQueue, []);
    __privateAdd(this, _audioSampleQueue, []);
    __privateAdd(this, _finalized, false);
    __privateMethod(this, _validateOptions, validateOptions_fn).call(this, options);
    options.video = deepClone(options.video);
    options.audio = deepClone(options.audio);
    options.fastStart = deepClone(options.fastStart);
    this.target = options.target;
    __privateSet(this, _options, {
      firstTimestampBehavior: "strict",
      ...options
    });
    if (options.target instanceof ArrayBufferTarget) {
      __privateSet(this, _writer, new ArrayBufferTargetWriter(options.target));
    } else if (options.target instanceof StreamTarget) {
      __privateSet(this, _writer, new StreamTargetWriter(options.target));
    } else if (options.target instanceof FileSystemWritableFileStreamTarget) {
      __privateSet(this, _writer, new FileSystemWritableFileStreamTargetWriter(options.target));
    } else {
      throw new Error(`Invalid target: ${options.target}`);
    }
    __privateMethod(this, _prepareTracks, prepareTracks_fn).call(this);
    __privateMethod(this, _writeHeader, writeHeader_fn).call(this);
  }
  addVideoChunk(sample, meta, timestamp, compositionTimeOffset) {
    if (!(sample instanceof EncodedVideoChunk)) {
      throw new TypeError("addVideoChunk's first argument (sample) must be of type EncodedVideoChunk.");
    }
    if (meta && typeof meta !== "object") {
      throw new TypeError("addVideoChunk's second argument (meta), when provided, must be an object.");
    }
    if (timestamp !== undefined && (!Number.isFinite(timestamp) || timestamp < 0)) {
      throw new TypeError("addVideoChunk's third argument (timestamp), when provided, must be a non-negative real number.");
    }
    if (compositionTimeOffset !== undefined && !Number.isFinite(compositionTimeOffset)) {
      throw new TypeError("addVideoChunk's fourth argument (compositionTimeOffset), when provided, must be a real number.");
    }
    let data = new Uint8Array(sample.byteLength);
    sample.copyTo(data);
    this.addVideoChunkRaw(data, sample.type, timestamp ?? sample.timestamp, sample.duration, meta, compositionTimeOffset);
  }
  addVideoChunkRaw(data, type, timestamp, duration, meta, compositionTimeOffset) {
    if (!(data instanceof Uint8Array)) {
      throw new TypeError("addVideoChunkRaw's first argument (data) must be an instance of Uint8Array.");
    }
    if (type !== "key" && type !== "delta") {
      throw new TypeError("addVideoChunkRaw's second argument (type) must be either 'key' or 'delta'.");
    }
    if (!Number.isFinite(timestamp) || timestamp < 0) {
      throw new TypeError("addVideoChunkRaw's third argument (timestamp) must be a non-negative real number.");
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError("addVideoChunkRaw's fourth argument (duration) must be a non-negative real number.");
    }
    if (meta && typeof meta !== "object") {
      throw new TypeError("addVideoChunkRaw's fifth argument (meta), when provided, must be an object.");
    }
    if (compositionTimeOffset !== undefined && !Number.isFinite(compositionTimeOffset)) {
      throw new TypeError("addVideoChunkRaw's sixth argument (compositionTimeOffset), when provided, must be a real number.");
    }
    __privateMethod(this, _ensureNotFinalized, ensureNotFinalized_fn).call(this);
    if (!__privateGet(this, _options).video)
      throw new Error("No video track declared.");
    if (typeof __privateGet(this, _options).fastStart === "object" && __privateGet(this, _videoTrack).samples.length === __privateGet(this, _options).fastStart.expectedVideoChunks) {
      throw new Error(`Cannot add more video chunks than specified in 'fastStart' (${__privateGet(this, _options).fastStart.expectedVideoChunks}).`);
    }
    let videoSample = __privateMethod(this, _createSampleForTrack, createSampleForTrack_fn).call(this, __privateGet(this, _videoTrack), data, type, timestamp, duration, meta, compositionTimeOffset);
    if (__privateGet(this, _options).fastStart === "fragmented" && __privateGet(this, _audioTrack)) {
      while (__privateGet(this, _audioSampleQueue).length > 0 && __privateGet(this, _audioSampleQueue)[0].decodeTimestamp <= videoSample.decodeTimestamp) {
        let audioSample = __privateGet(this, _audioSampleQueue).shift();
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _audioTrack), audioSample);
      }
      if (videoSample.decodeTimestamp <= __privateGet(this, _audioTrack).lastDecodeTimestamp) {
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _videoTrack), videoSample);
      } else {
        __privateGet(this, _videoSampleQueue).push(videoSample);
      }
    } else {
      __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _videoTrack), videoSample);
    }
  }
  addAudioChunk(sample, meta, timestamp) {
    if (!(sample instanceof EncodedAudioChunk)) {
      throw new TypeError("addAudioChunk's first argument (sample) must be of type EncodedAudioChunk.");
    }
    if (meta && typeof meta !== "object") {
      throw new TypeError("addAudioChunk's second argument (meta), when provided, must be an object.");
    }
    if (timestamp !== undefined && (!Number.isFinite(timestamp) || timestamp < 0)) {
      throw new TypeError("addAudioChunk's third argument (timestamp), when provided, must be a non-negative real number.");
    }
    let data = new Uint8Array(sample.byteLength);
    sample.copyTo(data);
    this.addAudioChunkRaw(data, sample.type, timestamp ?? sample.timestamp, sample.duration, meta);
  }
  addAudioChunkRaw(data, type, timestamp, duration, meta) {
    if (!(data instanceof Uint8Array)) {
      throw new TypeError("addAudioChunkRaw's first argument (data) must be an instance of Uint8Array.");
    }
    if (type !== "key" && type !== "delta") {
      throw new TypeError("addAudioChunkRaw's second argument (type) must be either 'key' or 'delta'.");
    }
    if (!Number.isFinite(timestamp) || timestamp < 0) {
      throw new TypeError("addAudioChunkRaw's third argument (timestamp) must be a non-negative real number.");
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError("addAudioChunkRaw's fourth argument (duration) must be a non-negative real number.");
    }
    if (meta && typeof meta !== "object") {
      throw new TypeError("addAudioChunkRaw's fifth argument (meta), when provided, must be an object.");
    }
    __privateMethod(this, _ensureNotFinalized, ensureNotFinalized_fn).call(this);
    if (!__privateGet(this, _options).audio)
      throw new Error("No audio track declared.");
    if (typeof __privateGet(this, _options).fastStart === "object" && __privateGet(this, _audioTrack).samples.length === __privateGet(this, _options).fastStart.expectedAudioChunks) {
      throw new Error(`Cannot add more audio chunks than specified in 'fastStart' (${__privateGet(this, _options).fastStart.expectedAudioChunks}).`);
    }
    let audioSample = __privateMethod(this, _createSampleForTrack, createSampleForTrack_fn).call(this, __privateGet(this, _audioTrack), data, type, timestamp, duration, meta);
    if (__privateGet(this, _options).fastStart === "fragmented" && __privateGet(this, _videoTrack)) {
      while (__privateGet(this, _videoSampleQueue).length > 0 && __privateGet(this, _videoSampleQueue)[0].decodeTimestamp <= audioSample.decodeTimestamp) {
        let videoSample = __privateGet(this, _videoSampleQueue).shift();
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _videoTrack), videoSample);
      }
      if (audioSample.decodeTimestamp <= __privateGet(this, _videoTrack).lastDecodeTimestamp) {
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _audioTrack), audioSample);
      } else {
        __privateGet(this, _audioSampleQueue).push(audioSample);
      }
    } else {
      __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _audioTrack), audioSample);
    }
  }
  finalize() {
    if (__privateGet(this, _finalized)) {
      throw new Error("Cannot finalize a muxer more than once.");
    }
    if (__privateGet(this, _options).fastStart === "fragmented") {
      for (let videoSample of __privateGet(this, _videoSampleQueue))
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _videoTrack), videoSample);
      for (let audioSample of __privateGet(this, _audioSampleQueue))
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _audioTrack), audioSample);
      __privateMethod(this, _finalizeFragment, finalizeFragment_fn).call(this, false);
    } else {
      if (__privateGet(this, _videoTrack))
        __privateMethod(this, _finalizeCurrentChunk, finalizeCurrentChunk_fn).call(this, __privateGet(this, _videoTrack));
      if (__privateGet(this, _audioTrack))
        __privateMethod(this, _finalizeCurrentChunk, finalizeCurrentChunk_fn).call(this, __privateGet(this, _audioTrack));
    }
    let tracks = [__privateGet(this, _videoTrack), __privateGet(this, _audioTrack)].filter(Boolean);
    if (__privateGet(this, _options).fastStart === "in-memory") {
      let mdatSize;
      for (let i = 0;i < 2; i++) {
        let movieBox2 = moov(tracks, __privateGet(this, _creationTime));
        let movieBoxSize = __privateGet(this, _writer).measureBox(movieBox2);
        mdatSize = __privateGet(this, _writer).measureBox(__privateGet(this, _mdat));
        let currentChunkPos = __privateGet(this, _writer).pos + movieBoxSize + mdatSize;
        for (let chunk of __privateGet(this, _finalizedChunks)) {
          chunk.offset = currentChunkPos;
          for (let { data } of chunk.samples) {
            currentChunkPos += data.byteLength;
            mdatSize += data.byteLength;
          }
        }
        if (currentChunkPos < 2 ** 32)
          break;
        if (mdatSize >= 2 ** 32)
          __privateGet(this, _mdat).largeSize = true;
      }
      let movieBox = moov(tracks, __privateGet(this, _creationTime));
      __privateGet(this, _writer).writeBox(movieBox);
      __privateGet(this, _mdat).size = mdatSize;
      __privateGet(this, _writer).writeBox(__privateGet(this, _mdat));
      for (let chunk of __privateGet(this, _finalizedChunks)) {
        for (let sample of chunk.samples) {
          __privateGet(this, _writer).write(sample.data);
          sample.data = null;
        }
      }
    } else if (__privateGet(this, _options).fastStart === "fragmented") {
      let startPos = __privateGet(this, _writer).pos;
      let mfraBox = mfra(tracks);
      __privateGet(this, _writer).writeBox(mfraBox);
      let mfraBoxSize = __privateGet(this, _writer).pos - startPos;
      __privateGet(this, _writer).seek(__privateGet(this, _writer).pos - 4);
      __privateGet(this, _writer).writeU32(mfraBoxSize);
    } else {
      let mdatPos = __privateGet(this, _writer).offsets.get(__privateGet(this, _mdat));
      let mdatSize = __privateGet(this, _writer).pos - mdatPos;
      __privateGet(this, _mdat).size = mdatSize;
      __privateGet(this, _mdat).largeSize = mdatSize >= 2 ** 32;
      __privateGet(this, _writer).patchBox(__privateGet(this, _mdat));
      let movieBox = moov(tracks, __privateGet(this, _creationTime));
      if (typeof __privateGet(this, _options).fastStart === "object") {
        __privateGet(this, _writer).seek(__privateGet(this, _ftypSize));
        __privateGet(this, _writer).writeBox(movieBox);
        let remainingBytes = mdatPos - __privateGet(this, _writer).pos;
        __privateGet(this, _writer).writeBox(free(remainingBytes));
      } else {
        __privateGet(this, _writer).writeBox(movieBox);
      }
    }
    __privateMethod(this, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn).call(this);
    __privateGet(this, _writer).finalize();
    __privateSet(this, _finalized, true);
  }
};
_options = new WeakMap;
_writer = new WeakMap;
_ftypSize = new WeakMap;
_mdat = new WeakMap;
_videoTrack = new WeakMap;
_audioTrack = new WeakMap;
_creationTime = new WeakMap;
_finalizedChunks = new WeakMap;
_nextFragmentNumber = new WeakMap;
_videoSampleQueue = new WeakMap;
_audioSampleQueue = new WeakMap;
_finalized = new WeakMap;
_validateOptions = new WeakSet;
validateOptions_fn = function(options) {
  if (typeof options !== "object") {
    throw new TypeError("The muxer requires an options object to be passed to its constructor.");
  }
  if (!(options.target instanceof Target)) {
    throw new TypeError("The target must be provided and an instance of Target.");
  }
  if (options.video) {
    if (!SUPPORTED_VIDEO_CODECS.includes(options.video.codec)) {
      throw new TypeError(`Unsupported video codec: ${options.video.codec}`);
    }
    if (!Number.isInteger(options.video.width) || options.video.width <= 0) {
      throw new TypeError(`Invalid video width: ${options.video.width}. Must be a positive integer.`);
    }
    if (!Number.isInteger(options.video.height) || options.video.height <= 0) {
      throw new TypeError(`Invalid video height: ${options.video.height}. Must be a positive integer.`);
    }
    const videoRotation = options.video.rotation;
    if (typeof videoRotation === "number" && ![0, 90, 180, 270].includes(videoRotation)) {
      throw new TypeError(`Invalid video rotation: ${videoRotation}. Has to be 0, 90, 180 or 270.`);
    } else if (Array.isArray(videoRotation) && (videoRotation.length !== 9 || videoRotation.some((value) => typeof value !== "number"))) {
      throw new TypeError(`Invalid video transformation matrix: ${videoRotation.join()}`);
    }
    if (options.video.frameRate !== undefined && (!Number.isInteger(options.video.frameRate) || options.video.frameRate <= 0)) {
      throw new TypeError(`Invalid video frame rate: ${options.video.frameRate}. Must be a positive integer.`);
    }
  }
  if (options.audio) {
    if (!SUPPORTED_AUDIO_CODECS.includes(options.audio.codec)) {
      throw new TypeError(`Unsupported audio codec: ${options.audio.codec}`);
    }
    if (!Number.isInteger(options.audio.numberOfChannels) || options.audio.numberOfChannels <= 0) {
      throw new TypeError(`Invalid number of audio channels: ${options.audio.numberOfChannels}. Must be a positive integer.`);
    }
    if (!Number.isInteger(options.audio.sampleRate) || options.audio.sampleRate <= 0) {
      throw new TypeError(`Invalid audio sample rate: ${options.audio.sampleRate}. Must be a positive integer.`);
    }
  }
  if (options.firstTimestampBehavior && !FIRST_TIMESTAMP_BEHAVIORS.includes(options.firstTimestampBehavior)) {
    throw new TypeError(`Invalid first timestamp behavior: ${options.firstTimestampBehavior}`);
  }
  if (typeof options.fastStart === "object") {
    if (options.video) {
      if (options.fastStart.expectedVideoChunks === undefined) {
        throw new TypeError(`'fastStart' is an object but is missing property 'expectedVideoChunks'.`);
      } else if (!Number.isInteger(options.fastStart.expectedVideoChunks) || options.fastStart.expectedVideoChunks < 0) {
        throw new TypeError(`'expectedVideoChunks' must be a non-negative integer.`);
      }
    }
    if (options.audio) {
      if (options.fastStart.expectedAudioChunks === undefined) {
        throw new TypeError(`'fastStart' is an object but is missing property 'expectedAudioChunks'.`);
      } else if (!Number.isInteger(options.fastStart.expectedAudioChunks) || options.fastStart.expectedAudioChunks < 0) {
        throw new TypeError(`'expectedAudioChunks' must be a non-negative integer.`);
      }
    }
  } else if (![false, "in-memory", "fragmented"].includes(options.fastStart)) {
    throw new TypeError(`'fastStart' option must be false, 'in-memory', 'fragmented' or an object.`);
  }
  if (options.minFragmentDuration !== undefined && (!Number.isFinite(options.minFragmentDuration) || options.minFragmentDuration < 0)) {
    throw new TypeError(`'minFragmentDuration' must be a non-negative number.`);
  }
};
_writeHeader = new WeakSet;
writeHeader_fn = function() {
  __privateGet(this, _writer).writeBox(ftyp({
    holdsAvc: __privateGet(this, _options).video?.codec === "avc",
    fragmented: __privateGet(this, _options).fastStart === "fragmented"
  }));
  __privateSet(this, _ftypSize, __privateGet(this, _writer).pos);
  if (__privateGet(this, _options).fastStart === "in-memory") {
    __privateSet(this, _mdat, mdat(false));
  } else if (__privateGet(this, _options).fastStart === "fragmented") {} else {
    if (typeof __privateGet(this, _options).fastStart === "object") {
      let moovSizeUpperBound = __privateMethod(this, _computeMoovSizeUpperBound, computeMoovSizeUpperBound_fn).call(this);
      __privateGet(this, _writer).seek(__privateGet(this, _writer).pos + moovSizeUpperBound);
    }
    __privateSet(this, _mdat, mdat(true));
    __privateGet(this, _writer).writeBox(__privateGet(this, _mdat));
  }
  __privateMethod(this, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn).call(this);
};
_computeMoovSizeUpperBound = new WeakSet;
computeMoovSizeUpperBound_fn = function() {
  if (typeof __privateGet(this, _options).fastStart !== "object")
    return;
  let upperBound = 0;
  let sampleCounts = [
    __privateGet(this, _options).fastStart.expectedVideoChunks,
    __privateGet(this, _options).fastStart.expectedAudioChunks
  ];
  for (let n of sampleCounts) {
    if (!n)
      continue;
    upperBound += (4 + 4) * Math.ceil(2 / 3 * n);
    upperBound += 4 * n;
    upperBound += (4 + 4 + 4) * Math.ceil(2 / 3 * n);
    upperBound += 4 * n;
    upperBound += 8 * n;
  }
  upperBound += 4096;
  return upperBound;
};
_prepareTracks = new WeakSet;
prepareTracks_fn = function() {
  if (__privateGet(this, _options).video) {
    __privateSet(this, _videoTrack, {
      id: 1,
      info: {
        type: "video",
        codec: __privateGet(this, _options).video.codec,
        width: __privateGet(this, _options).video.width,
        height: __privateGet(this, _options).video.height,
        rotation: __privateGet(this, _options).video.rotation ?? 0,
        decoderConfig: null
      },
      timescale: __privateGet(this, _options).video.frameRate ?? 57600,
      samples: [],
      finalizedChunks: [],
      currentChunk: null,
      firstDecodeTimestamp: undefined,
      lastDecodeTimestamp: -1,
      timeToSampleTable: [],
      compositionTimeOffsetTable: [],
      lastTimescaleUnits: null,
      lastSample: null,
      compactlyCodedChunkTable: []
    });
  }
  if (__privateGet(this, _options).audio) {
    __privateSet(this, _audioTrack, {
      id: __privateGet(this, _options).video ? 2 : 1,
      info: {
        type: "audio",
        codec: __privateGet(this, _options).audio.codec,
        numberOfChannels: __privateGet(this, _options).audio.numberOfChannels,
        sampleRate: __privateGet(this, _options).audio.sampleRate,
        decoderConfig: null
      },
      timescale: __privateGet(this, _options).audio.sampleRate,
      samples: [],
      finalizedChunks: [],
      currentChunk: null,
      firstDecodeTimestamp: undefined,
      lastDecodeTimestamp: -1,
      timeToSampleTable: [],
      compositionTimeOffsetTable: [],
      lastTimescaleUnits: null,
      lastSample: null,
      compactlyCodedChunkTable: []
    });
    if (__privateGet(this, _options).audio.codec === "aac") {
      let guessedCodecPrivate = __privateMethod(this, _generateMpeg4AudioSpecificConfig, generateMpeg4AudioSpecificConfig_fn).call(this, 2, __privateGet(this, _options).audio.sampleRate, __privateGet(this, _options).audio.numberOfChannels);
      __privateGet(this, _audioTrack).info.decoderConfig = {
        codec: __privateGet(this, _options).audio.codec,
        description: guessedCodecPrivate,
        numberOfChannels: __privateGet(this, _options).audio.numberOfChannels,
        sampleRate: __privateGet(this, _options).audio.sampleRate
      };
    }
  }
};
_generateMpeg4AudioSpecificConfig = new WeakSet;
generateMpeg4AudioSpecificConfig_fn = function(objectType, sampleRate, numberOfChannels) {
  let frequencyIndices = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
  let frequencyIndex = frequencyIndices.indexOf(sampleRate);
  let channelConfig = numberOfChannels;
  let configBits = "";
  configBits += objectType.toString(2).padStart(5, "0");
  configBits += frequencyIndex.toString(2).padStart(4, "0");
  if (frequencyIndex === 15)
    configBits += sampleRate.toString(2).padStart(24, "0");
  configBits += channelConfig.toString(2).padStart(4, "0");
  let paddingLength = Math.ceil(configBits.length / 8) * 8;
  configBits = configBits.padEnd(paddingLength, "0");
  let configBytes = new Uint8Array(configBits.length / 8);
  for (let i = 0;i < configBits.length; i += 8) {
    configBytes[i / 8] = parseInt(configBits.slice(i, i + 8), 2);
  }
  return configBytes;
};
_createSampleForTrack = new WeakSet;
createSampleForTrack_fn = function(track, data, type, timestamp, duration, meta, compositionTimeOffset) {
  let presentationTimestampInSeconds = timestamp / 1e6;
  let decodeTimestampInSeconds = (timestamp - (compositionTimeOffset ?? 0)) / 1e6;
  let durationInSeconds = duration / 1e6;
  let adjusted = __privateMethod(this, _validateTimestamp, validateTimestamp_fn).call(this, presentationTimestampInSeconds, decodeTimestampInSeconds, track);
  presentationTimestampInSeconds = adjusted.presentationTimestamp;
  decodeTimestampInSeconds = adjusted.decodeTimestamp;
  if (meta?.decoderConfig) {
    if (track.info.decoderConfig === null) {
      track.info.decoderConfig = meta.decoderConfig;
    } else {
      Object.assign(track.info.decoderConfig, meta.decoderConfig);
    }
  }
  let sample = {
    presentationTimestamp: presentationTimestampInSeconds,
    decodeTimestamp: decodeTimestampInSeconds,
    duration: durationInSeconds,
    data,
    size: data.byteLength,
    type,
    timescaleUnitsToNextSample: intoTimescale(durationInSeconds, track.timescale)
  };
  return sample;
};
_addSampleToTrack = new WeakSet;
addSampleToTrack_fn = function(track, sample) {
  if (__privateGet(this, _options).fastStart !== "fragmented") {
    track.samples.push(sample);
  }
  const sampleCompositionTimeOffset = intoTimescale(sample.presentationTimestamp - sample.decodeTimestamp, track.timescale);
  if (track.lastTimescaleUnits !== null) {
    let timescaleUnits = intoTimescale(sample.decodeTimestamp, track.timescale, false);
    let delta = Math.round(timescaleUnits - track.lastTimescaleUnits);
    track.lastTimescaleUnits += delta;
    track.lastSample.timescaleUnitsToNextSample = delta;
    if (__privateGet(this, _options).fastStart !== "fragmented") {
      let lastTableEntry = last(track.timeToSampleTable);
      if (lastTableEntry.sampleCount === 1) {
        lastTableEntry.sampleDelta = delta;
        lastTableEntry.sampleCount++;
      } else if (lastTableEntry.sampleDelta === delta) {
        lastTableEntry.sampleCount++;
      } else {
        lastTableEntry.sampleCount--;
        track.timeToSampleTable.push({
          sampleCount: 2,
          sampleDelta: delta
        });
      }
      const lastCompositionTimeOffsetTableEntry = last(track.compositionTimeOffsetTable);
      if (lastCompositionTimeOffsetTableEntry.sampleCompositionTimeOffset === sampleCompositionTimeOffset) {
        lastCompositionTimeOffsetTableEntry.sampleCount++;
      } else {
        track.compositionTimeOffsetTable.push({
          sampleCount: 1,
          sampleCompositionTimeOffset
        });
      }
    }
  } else {
    track.lastTimescaleUnits = 0;
    if (__privateGet(this, _options).fastStart !== "fragmented") {
      track.timeToSampleTable.push({
        sampleCount: 1,
        sampleDelta: intoTimescale(sample.duration, track.timescale)
      });
      track.compositionTimeOffsetTable.push({
        sampleCount: 1,
        sampleCompositionTimeOffset
      });
    }
  }
  track.lastSample = sample;
  let beginNewChunk = false;
  if (!track.currentChunk) {
    beginNewChunk = true;
  } else {
    let currentChunkDuration = sample.presentationTimestamp - track.currentChunk.startTimestamp;
    if (__privateGet(this, _options).fastStart === "fragmented") {
      let mostImportantTrack = __privateGet(this, _videoTrack) ?? __privateGet(this, _audioTrack);
      const chunkDuration = __privateGet(this, _options).minFragmentDuration ?? 1;
      if (track === mostImportantTrack && sample.type === "key" && currentChunkDuration >= chunkDuration) {
        beginNewChunk = true;
        __privateMethod(this, _finalizeFragment, finalizeFragment_fn).call(this);
      }
    } else {
      beginNewChunk = currentChunkDuration >= 0.5;
    }
  }
  if (beginNewChunk) {
    if (track.currentChunk) {
      __privateMethod(this, _finalizeCurrentChunk, finalizeCurrentChunk_fn).call(this, track);
    }
    track.currentChunk = {
      startTimestamp: sample.presentationTimestamp,
      samples: []
    };
  }
  track.currentChunk.samples.push(sample);
};
_validateTimestamp = new WeakSet;
validateTimestamp_fn = function(presentationTimestamp, decodeTimestamp, track) {
  const strictTimestampBehavior = __privateGet(this, _options).firstTimestampBehavior === "strict";
  const noLastDecodeTimestamp = track.lastDecodeTimestamp === -1;
  const timestampNonZero = decodeTimestamp !== 0;
  if (strictTimestampBehavior && noLastDecodeTimestamp && timestampNonZero) {
    throw new Error(`The first chunk for your media track must have a timestamp of 0 (received DTS=${decodeTimestamp}).Non-zero first timestamps are often caused by directly piping frames or audio data from a MediaStreamTrack into the encoder. Their timestamps are typically relative to the age of thedocument, which is probably what you want.

If you want to offset all timestamps of a track such that the first one is zero, set firstTimestampBehavior: 'offset' in the options.
`);
  } else if (__privateGet(this, _options).firstTimestampBehavior === "offset" || __privateGet(this, _options).firstTimestampBehavior === "cross-track-offset") {
    if (track.firstDecodeTimestamp === undefined) {
      track.firstDecodeTimestamp = decodeTimestamp;
    }
    let baseDecodeTimestamp;
    if (__privateGet(this, _options).firstTimestampBehavior === "offset") {
      baseDecodeTimestamp = track.firstDecodeTimestamp;
    } else {
      baseDecodeTimestamp = Math.min(__privateGet(this, _videoTrack)?.firstDecodeTimestamp ?? Infinity, __privateGet(this, _audioTrack)?.firstDecodeTimestamp ?? Infinity);
    }
    decodeTimestamp -= baseDecodeTimestamp;
    presentationTimestamp -= baseDecodeTimestamp;
  }
  if (decodeTimestamp < track.lastDecodeTimestamp) {
    throw new Error(`Timestamps must be monotonically increasing (DTS went from ${track.lastDecodeTimestamp * 1e6} to ${decodeTimestamp * 1e6}).`);
  }
  track.lastDecodeTimestamp = decodeTimestamp;
  return { presentationTimestamp, decodeTimestamp };
};
_finalizeCurrentChunk = new WeakSet;
finalizeCurrentChunk_fn = function(track) {
  if (__privateGet(this, _options).fastStart === "fragmented") {
    throw new Error("Can't finalize individual chunks if 'fastStart' is set to 'fragmented'.");
  }
  if (!track.currentChunk)
    return;
  track.finalizedChunks.push(track.currentChunk);
  __privateGet(this, _finalizedChunks).push(track.currentChunk);
  if (track.compactlyCodedChunkTable.length === 0 || last(track.compactlyCodedChunkTable).samplesPerChunk !== track.currentChunk.samples.length) {
    track.compactlyCodedChunkTable.push({
      firstChunk: track.finalizedChunks.length,
      samplesPerChunk: track.currentChunk.samples.length
    });
  }
  if (__privateGet(this, _options).fastStart === "in-memory") {
    track.currentChunk.offset = 0;
    return;
  }
  track.currentChunk.offset = __privateGet(this, _writer).pos;
  for (let sample of track.currentChunk.samples) {
    __privateGet(this, _writer).write(sample.data);
    sample.data = null;
  }
  __privateMethod(this, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn).call(this);
};
_finalizeFragment = new WeakSet;
finalizeFragment_fn = function(flushStreamingWriter = true) {
  if (__privateGet(this, _options).fastStart !== "fragmented") {
    throw new Error("Can't finalize a fragment unless 'fastStart' is set to 'fragmented'.");
  }
  let tracks = [__privateGet(this, _videoTrack), __privateGet(this, _audioTrack)].filter((track) => track && track.currentChunk);
  if (tracks.length === 0)
    return;
  let fragmentNumber = __privateWrapper(this, _nextFragmentNumber)._++;
  if (fragmentNumber === 1) {
    let movieBox = moov(tracks, __privateGet(this, _creationTime), true);
    __privateGet(this, _writer).writeBox(movieBox);
  }
  let moofOffset = __privateGet(this, _writer).pos;
  let moofBox = moof(fragmentNumber, tracks);
  __privateGet(this, _writer).writeBox(moofBox);
  {
    let mdatBox = mdat(false);
    let totalTrackSampleSize = 0;
    for (let track of tracks) {
      for (let sample of track.currentChunk.samples) {
        totalTrackSampleSize += sample.size;
      }
    }
    let mdatSize = __privateGet(this, _writer).measureBox(mdatBox) + totalTrackSampleSize;
    if (mdatSize >= 2 ** 32) {
      mdatBox.largeSize = true;
      mdatSize = __privateGet(this, _writer).measureBox(mdatBox) + totalTrackSampleSize;
    }
    mdatBox.size = mdatSize;
    __privateGet(this, _writer).writeBox(mdatBox);
  }
  for (let track of tracks) {
    track.currentChunk.offset = __privateGet(this, _writer).pos;
    track.currentChunk.moofOffset = moofOffset;
    for (let sample of track.currentChunk.samples) {
      __privateGet(this, _writer).write(sample.data);
      sample.data = null;
    }
  }
  let endPos = __privateGet(this, _writer).pos;
  __privateGet(this, _writer).seek(__privateGet(this, _writer).offsets.get(moofBox));
  let newMoofBox = moof(fragmentNumber, tracks);
  __privateGet(this, _writer).writeBox(newMoofBox);
  __privateGet(this, _writer).seek(endPos);
  for (let track of tracks) {
    track.finalizedChunks.push(track.currentChunk);
    __privateGet(this, _finalizedChunks).push(track.currentChunk);
    track.currentChunk = null;
  }
  if (flushStreamingWriter) {
    __privateMethod(this, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn).call(this);
  }
};
_maybeFlushStreamingTargetWriter = new WeakSet;
maybeFlushStreamingTargetWriter_fn = function() {
  if (__privateGet(this, _writer) instanceof StreamTargetWriter) {
    __privateGet(this, _writer).flush();
  }
};
_ensureNotFinalized = new WeakSet;
ensureNotFinalized_fn = function() {
  if (__privateGet(this, _finalized)) {
    throw new Error("Cannot add new video or audio chunks after the file has been finalized.");
  }
};

// node_modules/webm-muxer/build/webm-muxer.mjs
var __accessCheck2 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet2 = (obj, member, getter) => {
  __accessCheck2(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd2 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet2 = (obj, member, value, setter) => {
  __accessCheck2(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod2 = (obj, member, method) => {
  __accessCheck2(obj, member, "access private method");
  return method;
};
var EBMLFloat32 = class {
  constructor(value) {
    this.value = value;
  }
};
var EBMLFloat64 = class {
  constructor(value) {
    this.value = value;
  }
};
var measureUnsignedInt = (value) => {
  if (value < 1 << 8) {
    return 1;
  } else if (value < 1 << 16) {
    return 2;
  } else if (value < 1 << 24) {
    return 3;
  } else if (value < 2 ** 32) {
    return 4;
  } else if (value < 2 ** 40) {
    return 5;
  } else {
    return 6;
  }
};
var measureEBMLVarInt = (value) => {
  if (value < (1 << 7) - 1) {
    return 1;
  } else if (value < (1 << 14) - 1) {
    return 2;
  } else if (value < (1 << 21) - 1) {
    return 3;
  } else if (value < (1 << 28) - 1) {
    return 4;
  } else if (value < 2 ** 35 - 1) {
    return 5;
  } else if (value < 2 ** 42 - 1) {
    return 6;
  } else {
    throw new Error("EBML VINT size not supported " + value);
  }
};
var readBits = (bytes2, start, end) => {
  let result = 0;
  for (let i = start;i < end; i++) {
    let byteIndex = Math.floor(i / 8);
    let byte = bytes2[byteIndex];
    let bitIndex = 7 - (i & 7);
    let bit = (byte & 1 << bitIndex) >> bitIndex;
    result <<= 1;
    result |= bit;
  }
  return result;
};
var writeBits = (bytes2, start, end, value) => {
  for (let i = start;i < end; i++) {
    let byteIndex = Math.floor(i / 8);
    let byte = bytes2[byteIndex];
    let bitIndex = 7 - (i & 7);
    byte &= ~(1 << bitIndex);
    byte |= (value & 1 << end - i - 1) >> end - i - 1 << bitIndex;
    bytes2[byteIndex] = byte;
  }
};
var isTarget2 = Symbol("isTarget");
var Target2 = class {
};
var _helper2;
var _helperView2;
var _writeByte;
var writeByte_fn;
var _writeFloat32;
var writeFloat32_fn;
var _writeFloat64;
var writeFloat64_fn;
var _writeUnsignedInt;
var writeUnsignedInt_fn;
var _writeString;
var writeString_fn;
var Writer2 = class {
  constructor() {
    __privateAdd2(this, _writeByte);
    __privateAdd2(this, _writeFloat32);
    __privateAdd2(this, _writeFloat64);
    __privateAdd2(this, _writeUnsignedInt);
    __privateAdd2(this, _writeString);
    this.pos = 0;
    __privateAdd2(this, _helper2, new Uint8Array(8));
    __privateAdd2(this, _helperView2, new DataView(__privateGet2(this, _helper2).buffer));
    this.offsets = /* @__PURE__ */ new WeakMap;
    this.dataOffsets = /* @__PURE__ */ new WeakMap;
  }
  seek(newPos) {
    this.pos = newPos;
  }
  writeEBMLVarInt(value, width = measureEBMLVarInt(value)) {
    let pos = 0;
    switch (width) {
      case 1:
        __privateGet2(this, _helperView2).setUint8(pos++, 1 << 7 | value);
        break;
      case 2:
        __privateGet2(this, _helperView2).setUint8(pos++, 1 << 6 | value >> 8);
        __privateGet2(this, _helperView2).setUint8(pos++, value);
        break;
      case 3:
        __privateGet2(this, _helperView2).setUint8(pos++, 1 << 5 | value >> 16);
        __privateGet2(this, _helperView2).setUint8(pos++, value >> 8);
        __privateGet2(this, _helperView2).setUint8(pos++, value);
        break;
      case 4:
        __privateGet2(this, _helperView2).setUint8(pos++, 1 << 4 | value >> 24);
        __privateGet2(this, _helperView2).setUint8(pos++, value >> 16);
        __privateGet2(this, _helperView2).setUint8(pos++, value >> 8);
        __privateGet2(this, _helperView2).setUint8(pos++, value);
        break;
      case 5:
        __privateGet2(this, _helperView2).setUint8(pos++, 1 << 3 | value / 2 ** 32 & 7);
        __privateGet2(this, _helperView2).setUint8(pos++, value >> 24);
        __privateGet2(this, _helperView2).setUint8(pos++, value >> 16);
        __privateGet2(this, _helperView2).setUint8(pos++, value >> 8);
        __privateGet2(this, _helperView2).setUint8(pos++, value);
        break;
      case 6:
        __privateGet2(this, _helperView2).setUint8(pos++, 1 << 2 | value / 2 ** 40 & 3);
        __privateGet2(this, _helperView2).setUint8(pos++, value / 2 ** 32 | 0);
        __privateGet2(this, _helperView2).setUint8(pos++, value >> 24);
        __privateGet2(this, _helperView2).setUint8(pos++, value >> 16);
        __privateGet2(this, _helperView2).setUint8(pos++, value >> 8);
        __privateGet2(this, _helperView2).setUint8(pos++, value);
        break;
      default:
        throw new Error("Bad EBML VINT size " + width);
    }
    this.write(__privateGet2(this, _helper2).subarray(0, pos));
  }
  writeEBML(data) {
    if (data === null)
      return;
    if (data instanceof Uint8Array) {
      this.write(data);
    } else if (Array.isArray(data)) {
      for (let elem of data) {
        this.writeEBML(elem);
      }
    } else {
      this.offsets.set(data, this.pos);
      __privateMethod2(this, _writeUnsignedInt, writeUnsignedInt_fn).call(this, data.id);
      if (Array.isArray(data.data)) {
        let sizePos = this.pos;
        let sizeSize = data.size === -1 ? 1 : data.size ?? 4;
        if (data.size === -1) {
          __privateMethod2(this, _writeByte, writeByte_fn).call(this, 255);
        } else {
          this.seek(this.pos + sizeSize);
        }
        let startPos = this.pos;
        this.dataOffsets.set(data, startPos);
        this.writeEBML(data.data);
        if (data.size !== -1) {
          let size = this.pos - startPos;
          let endPos = this.pos;
          this.seek(sizePos);
          this.writeEBMLVarInt(size, sizeSize);
          this.seek(endPos);
        }
      } else if (typeof data.data === "number") {
        let size = data.size ?? measureUnsignedInt(data.data);
        this.writeEBMLVarInt(size);
        __privateMethod2(this, _writeUnsignedInt, writeUnsignedInt_fn).call(this, data.data, size);
      } else if (typeof data.data === "string") {
        this.writeEBMLVarInt(data.data.length);
        __privateMethod2(this, _writeString, writeString_fn).call(this, data.data);
      } else if (data.data instanceof Uint8Array) {
        this.writeEBMLVarInt(data.data.byteLength, data.size);
        this.write(data.data);
      } else if (data.data instanceof EBMLFloat32) {
        this.writeEBMLVarInt(4);
        __privateMethod2(this, _writeFloat32, writeFloat32_fn).call(this, data.data.value);
      } else if (data.data instanceof EBMLFloat64) {
        this.writeEBMLVarInt(8);
        __privateMethod2(this, _writeFloat64, writeFloat64_fn).call(this, data.data.value);
      }
    }
  }
};
_helper2 = new WeakMap;
_helperView2 = new WeakMap;
_writeByte = new WeakSet;
writeByte_fn = function(value) {
  __privateGet2(this, _helperView2).setUint8(0, value);
  this.write(__privateGet2(this, _helper2).subarray(0, 1));
};
_writeFloat32 = new WeakSet;
writeFloat32_fn = function(value) {
  __privateGet2(this, _helperView2).setFloat32(0, value, false);
  this.write(__privateGet2(this, _helper2).subarray(0, 4));
};
_writeFloat64 = new WeakSet;
writeFloat64_fn = function(value) {
  __privateGet2(this, _helperView2).setFloat64(0, value, false);
  this.write(__privateGet2(this, _helper2));
};
_writeUnsignedInt = new WeakSet;
writeUnsignedInt_fn = function(value, width = measureUnsignedInt(value)) {
  let pos = 0;
  switch (width) {
    case 6:
      __privateGet2(this, _helperView2).setUint8(pos++, value / 2 ** 40 | 0);
    case 5:
      __privateGet2(this, _helperView2).setUint8(pos++, value / 2 ** 32 | 0);
    case 4:
      __privateGet2(this, _helperView2).setUint8(pos++, value >> 24);
    case 3:
      __privateGet2(this, _helperView2).setUint8(pos++, value >> 16);
    case 2:
      __privateGet2(this, _helperView2).setUint8(pos++, value >> 8);
    case 1:
      __privateGet2(this, _helperView2).setUint8(pos++, value);
      break;
    default:
      throw new Error("Bad UINT size " + width);
  }
  this.write(__privateGet2(this, _helper2).subarray(0, pos));
};
_writeString = new WeakSet;
writeString_fn = function(str) {
  this.write(new Uint8Array(str.split("").map((x) => x.charCodeAt(0))));
};
var _target3;
var _buffer2;
var _bytes2;
var _ensureSize2;
var ensureSize_fn2;
_target3 = new WeakMap;
_buffer2 = new WeakMap;
_bytes2 = new WeakMap;
_ensureSize2 = new WeakSet;
ensureSize_fn2 = function(size) {
  let newLength = __privateGet2(this, _buffer2).byteLength;
  while (newLength < size)
    newLength *= 2;
  if (newLength === __privateGet2(this, _buffer2).byteLength)
    return;
  let newBuffer = new ArrayBuffer(newLength);
  let newBytes = new Uint8Array(newBuffer);
  newBytes.set(__privateGet2(this, _bytes2), 0);
  __privateSet2(this, _buffer2, newBuffer);
  __privateSet2(this, _bytes2, newBytes);
};
var _trackingWrites;
var _trackedWrites;
var _trackedStart;
var _trackedEnd;
var BaseStreamTargetWriter = class extends Writer2 {
  constructor(target) {
    super();
    this.target = target;
    __privateAdd2(this, _trackingWrites, false);
    __privateAdd2(this, _trackedWrites, undefined);
    __privateAdd2(this, _trackedStart, undefined);
    __privateAdd2(this, _trackedEnd, undefined);
  }
  write(data) {
    if (!__privateGet2(this, _trackingWrites))
      return;
    let pos = this.pos;
    if (pos < __privateGet2(this, _trackedStart)) {
      if (pos + data.byteLength <= __privateGet2(this, _trackedStart))
        return;
      data = data.subarray(__privateGet2(this, _trackedStart) - pos);
      pos = 0;
    }
    let neededSize = pos + data.byteLength - __privateGet2(this, _trackedStart);
    let newLength = __privateGet2(this, _trackedWrites).byteLength;
    while (newLength < neededSize)
      newLength *= 2;
    if (newLength !== __privateGet2(this, _trackedWrites).byteLength) {
      let copy = new Uint8Array(newLength);
      copy.set(__privateGet2(this, _trackedWrites), 0);
      __privateSet2(this, _trackedWrites, copy);
    }
    __privateGet2(this, _trackedWrites).set(data, pos - __privateGet2(this, _trackedStart));
    __privateSet2(this, _trackedEnd, Math.max(__privateGet2(this, _trackedEnd), pos + data.byteLength));
  }
  startTrackingWrites() {
    __privateSet2(this, _trackingWrites, true);
    __privateSet2(this, _trackedWrites, new Uint8Array(2 ** 10));
    __privateSet2(this, _trackedStart, this.pos);
    __privateSet2(this, _trackedEnd, this.pos);
  }
  getTrackedWrites() {
    if (!__privateGet2(this, _trackingWrites)) {
      throw new Error("Can't get tracked writes since nothing was tracked.");
    }
    let slice = __privateGet2(this, _trackedWrites).subarray(0, __privateGet2(this, _trackedEnd) - __privateGet2(this, _trackedStart));
    let result = {
      data: slice,
      start: __privateGet2(this, _trackedStart),
      end: __privateGet2(this, _trackedEnd)
    };
    __privateSet2(this, _trackedWrites, undefined);
    __privateSet2(this, _trackingWrites, false);
    return result;
  }
};
_trackingWrites = new WeakMap;
_trackedWrites = new WeakMap;
_trackedStart = new WeakMap;
_trackedEnd = new WeakMap;
var DEFAULT_CHUNK_SIZE2 = 2 ** 24;
var MAX_CHUNKS_AT_ONCE2 = 2;
var _sections2;
var _lastFlushEnd;
var _ensureMonotonicity;
var _chunked2;
var _chunkSize2;
var _chunks2;
var _writeDataIntoChunks2;
var writeDataIntoChunks_fn2;
var _insertSectionIntoChunk2;
var insertSectionIntoChunk_fn2;
var _createChunk2;
var createChunk_fn2;
var _flushChunks2;
var flushChunks_fn2;
var StreamTargetWriter2 = class extends BaseStreamTargetWriter {
  constructor(target, ensureMonotonicity) {
    super(target);
    __privateAdd2(this, _writeDataIntoChunks2);
    __privateAdd2(this, _insertSectionIntoChunk2);
    __privateAdd2(this, _createChunk2);
    __privateAdd2(this, _flushChunks2);
    __privateAdd2(this, _sections2, []);
    __privateAdd2(this, _lastFlushEnd, 0);
    __privateAdd2(this, _ensureMonotonicity, undefined);
    __privateAdd2(this, _chunked2, undefined);
    __privateAdd2(this, _chunkSize2, undefined);
    __privateAdd2(this, _chunks2, []);
    __privateSet2(this, _ensureMonotonicity, ensureMonotonicity);
    __privateSet2(this, _chunked2, target.options?.chunked ?? false);
    __privateSet2(this, _chunkSize2, target.options?.chunkSize ?? DEFAULT_CHUNK_SIZE2);
  }
  write(data) {
    super.write(data);
    __privateGet2(this, _sections2).push({
      data: data.slice(),
      start: this.pos
    });
    this.pos += data.byteLength;
  }
  flush() {
    if (__privateGet2(this, _sections2).length === 0)
      return;
    let chunks = [];
    let sorted = [...__privateGet2(this, _sections2)].sort((a, b) => a.start - b.start);
    chunks.push({
      start: sorted[0].start,
      size: sorted[0].data.byteLength
    });
    for (let i = 1;i < sorted.length; i++) {
      let lastChunk = chunks[chunks.length - 1];
      let section = sorted[i];
      if (section.start <= lastChunk.start + lastChunk.size) {
        lastChunk.size = Math.max(lastChunk.size, section.start + section.data.byteLength - lastChunk.start);
      } else {
        chunks.push({
          start: section.start,
          size: section.data.byteLength
        });
      }
    }
    for (let chunk of chunks) {
      chunk.data = new Uint8Array(chunk.size);
      for (let section of __privateGet2(this, _sections2)) {
        if (chunk.start <= section.start && section.start < chunk.start + chunk.size) {
          chunk.data.set(section.data, section.start - chunk.start);
        }
      }
      if (__privateGet2(this, _chunked2)) {
        __privateMethod2(this, _writeDataIntoChunks2, writeDataIntoChunks_fn2).call(this, chunk.data, chunk.start);
        __privateMethod2(this, _flushChunks2, flushChunks_fn2).call(this);
      } else {
        if (__privateGet2(this, _ensureMonotonicity) && chunk.start < __privateGet2(this, _lastFlushEnd)) {
          throw new Error("Internal error: Monotonicity violation.");
        }
        this.target.options.onData?.(chunk.data, chunk.start);
        __privateSet2(this, _lastFlushEnd, chunk.start + chunk.data.byteLength);
      }
    }
    __privateGet2(this, _sections2).length = 0;
  }
  finalize() {
    if (__privateGet2(this, _chunked2)) {
      __privateMethod2(this, _flushChunks2, flushChunks_fn2).call(this, true);
    }
  }
};
_sections2 = new WeakMap;
_lastFlushEnd = new WeakMap;
_ensureMonotonicity = new WeakMap;
_chunked2 = new WeakMap;
_chunkSize2 = new WeakMap;
_chunks2 = new WeakMap;
_writeDataIntoChunks2 = new WeakSet;
writeDataIntoChunks_fn2 = function(data, position) {
  let chunkIndex = __privateGet2(this, _chunks2).findIndex((x) => x.start <= position && position < x.start + __privateGet2(this, _chunkSize2));
  if (chunkIndex === -1)
    chunkIndex = __privateMethod2(this, _createChunk2, createChunk_fn2).call(this, position);
  let chunk = __privateGet2(this, _chunks2)[chunkIndex];
  let relativePosition = position - chunk.start;
  let toWrite = data.subarray(0, Math.min(__privateGet2(this, _chunkSize2) - relativePosition, data.byteLength));
  chunk.data.set(toWrite, relativePosition);
  let section = {
    start: relativePosition,
    end: relativePosition + toWrite.byteLength
  };
  __privateMethod2(this, _insertSectionIntoChunk2, insertSectionIntoChunk_fn2).call(this, chunk, section);
  if (chunk.written[0].start === 0 && chunk.written[0].end === __privateGet2(this, _chunkSize2)) {
    chunk.shouldFlush = true;
  }
  if (__privateGet2(this, _chunks2).length > MAX_CHUNKS_AT_ONCE2) {
    for (let i = 0;i < __privateGet2(this, _chunks2).length - 1; i++) {
      __privateGet2(this, _chunks2)[i].shouldFlush = true;
    }
    __privateMethod2(this, _flushChunks2, flushChunks_fn2).call(this);
  }
  if (toWrite.byteLength < data.byteLength) {
    __privateMethod2(this, _writeDataIntoChunks2, writeDataIntoChunks_fn2).call(this, data.subarray(toWrite.byteLength), position + toWrite.byteLength);
  }
};
_insertSectionIntoChunk2 = new WeakSet;
insertSectionIntoChunk_fn2 = function(chunk, section) {
  let low = 0;
  let high = chunk.written.length - 1;
  let index = -1;
  while (low <= high) {
    let mid = Math.floor(low + (high - low + 1) / 2);
    if (chunk.written[mid].start <= section.start) {
      low = mid + 1;
      index = mid;
    } else {
      high = mid - 1;
    }
  }
  chunk.written.splice(index + 1, 0, section);
  if (index === -1 || chunk.written[index].end < section.start)
    index++;
  while (index < chunk.written.length - 1 && chunk.written[index].end >= chunk.written[index + 1].start) {
    chunk.written[index].end = Math.max(chunk.written[index].end, chunk.written[index + 1].end);
    chunk.written.splice(index + 1, 1);
  }
};
_createChunk2 = new WeakSet;
createChunk_fn2 = function(includesPosition) {
  let start = Math.floor(includesPosition / __privateGet2(this, _chunkSize2)) * __privateGet2(this, _chunkSize2);
  let chunk = {
    start,
    data: new Uint8Array(__privateGet2(this, _chunkSize2)),
    written: [],
    shouldFlush: false
  };
  __privateGet2(this, _chunks2).push(chunk);
  __privateGet2(this, _chunks2).sort((a, b) => a.start - b.start);
  return __privateGet2(this, _chunks2).indexOf(chunk);
};
_flushChunks2 = new WeakSet;
flushChunks_fn2 = function(force = false) {
  for (let i = 0;i < __privateGet2(this, _chunks2).length; i++) {
    let chunk = __privateGet2(this, _chunks2)[i];
    if (!chunk.shouldFlush && !force)
      continue;
    for (let section of chunk.written) {
      if (__privateGet2(this, _ensureMonotonicity) && chunk.start + section.start < __privateGet2(this, _lastFlushEnd)) {
        throw new Error("Internal error: Monotonicity violation.");
      }
      this.target.options.onData?.(chunk.data.subarray(section.start, section.end), chunk.start + section.start);
      __privateSet2(this, _lastFlushEnd, chunk.start + section.end);
    }
    __privateGet2(this, _chunks2).splice(i--, 1);
  }
};
var VIDEO_TRACK_NUMBER = 1;
var AUDIO_TRACK_NUMBER = 2;
var SUBTITLE_TRACK_NUMBER = 3;
var VIDEO_TRACK_TYPE = 1;
var AUDIO_TRACK_TYPE = 2;
var SUBTITLE_TRACK_TYPE = 17;
var MAX_CHUNK_LENGTH_MS = 2 ** 15;
var CODEC_PRIVATE_MAX_SIZE = 2 ** 13;
var APP_NAME = "https://github.com/Vanilagy/webm-muxer";
var SEGMENT_SIZE_BYTES = 6;
var CLUSTER_SIZE_BYTES = 5;
var FIRST_TIMESTAMP_BEHAVIORS2 = ["strict", "offset", "permissive"];
var _options2;
var _writer2;
var _segment;
var _segmentInfo;
var _seekHead;
var _tracksElement;
var _segmentDuration;
var _colourElement;
var _videoCodecPrivate;
var _audioCodecPrivate;
var _subtitleCodecPrivate;
var _cues;
var _currentCluster;
var _currentClusterTimestamp;
var _duration;
var _videoChunkQueue;
var _audioChunkQueue;
var _subtitleChunkQueue;
var _firstVideoTimestamp;
var _firstAudioTimestamp;
var _lastVideoTimestamp;
var _lastAudioTimestamp;
var _lastSubtitleTimestamp;
var _colorSpace;
var _finalized2;
var _validateOptions2;
var validateOptions_fn2;
var _createFileHeader;
var createFileHeader_fn;
var _writeEBMLHeader;
var writeEBMLHeader_fn;
var _createCodecPrivatePlaceholders;
var createCodecPrivatePlaceholders_fn;
var _createColourElement;
var createColourElement_fn;
var _createSeekHead;
var createSeekHead_fn;
var _createSegmentInfo;
var createSegmentInfo_fn;
var _createTracks;
var createTracks_fn;
var _createSegment;
var createSegment_fn;
var _createCues;
var createCues_fn;
var _maybeFlushStreamingTargetWriter2;
var maybeFlushStreamingTargetWriter_fn2;
var _segmentDataOffset;
var segmentDataOffset_get;
var _writeVideoDecoderConfig;
var writeVideoDecoderConfig_fn;
var _fixVP9ColorSpace;
var fixVP9ColorSpace_fn;
var _writeSubtitleChunks;
var writeSubtitleChunks_fn;
var _createInternalChunk;
var createInternalChunk_fn;
var _validateTimestamp2;
var validateTimestamp_fn2;
var _writeBlock;
var writeBlock_fn;
var _createCodecPrivateElement;
var createCodecPrivateElement_fn;
var _writeCodecPrivate;
var writeCodecPrivate_fn;
var _createNewCluster;
var createNewCluster_fn;
var _finalizeCurrentCluster;
var finalizeCurrentCluster_fn;
var _ensureNotFinalized2;
var ensureNotFinalized_fn2;
_options2 = new WeakMap;
_writer2 = new WeakMap;
_segment = new WeakMap;
_segmentInfo = new WeakMap;
_seekHead = new WeakMap;
_tracksElement = new WeakMap;
_segmentDuration = new WeakMap;
_colourElement = new WeakMap;
_videoCodecPrivate = new WeakMap;
_audioCodecPrivate = new WeakMap;
_subtitleCodecPrivate = new WeakMap;
_cues = new WeakMap;
_currentCluster = new WeakMap;
_currentClusterTimestamp = new WeakMap;
_duration = new WeakMap;
_videoChunkQueue = new WeakMap;
_audioChunkQueue = new WeakMap;
_subtitleChunkQueue = new WeakMap;
_firstVideoTimestamp = new WeakMap;
_firstAudioTimestamp = new WeakMap;
_lastVideoTimestamp = new WeakMap;
_lastAudioTimestamp = new WeakMap;
_lastSubtitleTimestamp = new WeakMap;
_colorSpace = new WeakMap;
_finalized2 = new WeakMap;
_validateOptions2 = new WeakSet;
validateOptions_fn2 = function(options) {
  if (typeof options !== "object") {
    throw new TypeError("The muxer requires an options object to be passed to its constructor.");
  }
  if (!(options.target instanceof Target2)) {
    throw new TypeError("The target must be provided and an instance of Target.");
  }
  if (options.video) {
    if (typeof options.video.codec !== "string") {
      throw new TypeError(`Invalid video codec: ${options.video.codec}. Must be a string.`);
    }
    if (!Number.isInteger(options.video.width) || options.video.width <= 0) {
      throw new TypeError(`Invalid video width: ${options.video.width}. Must be a positive integer.`);
    }
    if (!Number.isInteger(options.video.height) || options.video.height <= 0) {
      throw new TypeError(`Invalid video height: ${options.video.height}. Must be a positive integer.`);
    }
    if (options.video.frameRate !== undefined) {
      if (!Number.isFinite(options.video.frameRate) || options.video.frameRate <= 0) {
        throw new TypeError(`Invalid video frame rate: ${options.video.frameRate}. Must be a positive number.`);
      }
    }
    if (options.video.alpha !== undefined && typeof options.video.alpha !== "boolean") {
      throw new TypeError(`Invalid video alpha: ${options.video.alpha}. Must be a boolean.`);
    }
  }
  if (options.audio) {
    if (typeof options.audio.codec !== "string") {
      throw new TypeError(`Invalid audio codec: ${options.audio.codec}. Must be a string.`);
    }
    if (!Number.isInteger(options.audio.numberOfChannels) || options.audio.numberOfChannels <= 0) {
      throw new TypeError(`Invalid number of audio channels: ${options.audio.numberOfChannels}. Must be a positive integer.`);
    }
    if (!Number.isInteger(options.audio.sampleRate) || options.audio.sampleRate <= 0) {
      throw new TypeError(`Invalid audio sample rate: ${options.audio.sampleRate}. Must be a positive integer.`);
    }
    if (options.audio.bitDepth !== undefined) {
      if (!Number.isInteger(options.audio.bitDepth) || options.audio.bitDepth <= 0) {
        throw new TypeError(`Invalid audio bit depth: ${options.audio.bitDepth}. Must be a positive integer.`);
      }
    }
  }
  if (options.subtitles) {
    if (typeof options.subtitles.codec !== "string") {
      throw new TypeError(`Invalid subtitles codec: ${options.subtitles.codec}. Must be a string.`);
    }
  }
  if (options.type !== undefined && !["webm", "matroska"].includes(options.type)) {
    throw new TypeError(`Invalid type: ${options.type}. Must be 'webm' or 'matroska'.`);
  }
  if (options.firstTimestampBehavior && !FIRST_TIMESTAMP_BEHAVIORS2.includes(options.firstTimestampBehavior)) {
    throw new TypeError(`Invalid first timestamp behavior: ${options.firstTimestampBehavior}`);
  }
  if (options.streaming !== undefined && typeof options.streaming !== "boolean") {
    throw new TypeError(`Invalid streaming option: ${options.streaming}. Must be a boolean.`);
  }
};
_createFileHeader = new WeakSet;
createFileHeader_fn = function() {
  if (__privateGet2(this, _writer2) instanceof BaseStreamTargetWriter && __privateGet2(this, _writer2).target.options.onHeader) {
    __privateGet2(this, _writer2).startTrackingWrites();
  }
  __privateMethod2(this, _writeEBMLHeader, writeEBMLHeader_fn).call(this);
  if (!__privateGet2(this, _options2).streaming) {
    __privateMethod2(this, _createSeekHead, createSeekHead_fn).call(this);
  }
  __privateMethod2(this, _createSegmentInfo, createSegmentInfo_fn).call(this);
  __privateMethod2(this, _createCodecPrivatePlaceholders, createCodecPrivatePlaceholders_fn).call(this);
  __privateMethod2(this, _createColourElement, createColourElement_fn).call(this);
  if (!__privateGet2(this, _options2).streaming) {
    __privateMethod2(this, _createTracks, createTracks_fn).call(this);
    __privateMethod2(this, _createSegment, createSegment_fn).call(this);
  }
  __privateMethod2(this, _createCues, createCues_fn).call(this);
  __privateMethod2(this, _maybeFlushStreamingTargetWriter2, maybeFlushStreamingTargetWriter_fn2).call(this);
};
_writeEBMLHeader = new WeakSet;
writeEBMLHeader_fn = function() {
  let ebmlHeader = { id: 440786851, data: [
    { id: 17030, data: 1 },
    { id: 17143, data: 1 },
    { id: 17138, data: 4 },
    { id: 17139, data: 8 },
    { id: 17026, data: __privateGet2(this, _options2).type ?? "webm" },
    { id: 17031, data: 2 },
    { id: 17029, data: 2 }
  ] };
  __privateGet2(this, _writer2).writeEBML(ebmlHeader);
};
_createCodecPrivatePlaceholders = new WeakSet;
createCodecPrivatePlaceholders_fn = function() {
  __privateSet2(this, _videoCodecPrivate, { id: 236, size: 4, data: new Uint8Array(CODEC_PRIVATE_MAX_SIZE) });
  __privateSet2(this, _audioCodecPrivate, { id: 236, size: 4, data: new Uint8Array(CODEC_PRIVATE_MAX_SIZE) });
  __privateSet2(this, _subtitleCodecPrivate, { id: 236, size: 4, data: new Uint8Array(CODEC_PRIVATE_MAX_SIZE) });
};
_createColourElement = new WeakSet;
createColourElement_fn = function() {
  __privateSet2(this, _colourElement, { id: 21936, data: [
    { id: 21937, data: 2 },
    { id: 21946, data: 2 },
    { id: 21947, data: 2 },
    { id: 21945, data: 0 }
  ] });
};
_createSeekHead = new WeakSet;
createSeekHead_fn = function() {
  const kaxCues = new Uint8Array([28, 83, 187, 107]);
  const kaxInfo = new Uint8Array([21, 73, 169, 102]);
  const kaxTracks = new Uint8Array([22, 84, 174, 107]);
  let seekHead = { id: 290298740, data: [
    { id: 19899, data: [
      { id: 21419, data: kaxCues },
      { id: 21420, size: 5, data: 0 }
    ] },
    { id: 19899, data: [
      { id: 21419, data: kaxInfo },
      { id: 21420, size: 5, data: 0 }
    ] },
    { id: 19899, data: [
      { id: 21419, data: kaxTracks },
      { id: 21420, size: 5, data: 0 }
    ] }
  ] };
  __privateSet2(this, _seekHead, seekHead);
};
_createSegmentInfo = new WeakSet;
createSegmentInfo_fn = function() {
  let segmentDuration = { id: 17545, data: new EBMLFloat64(0) };
  __privateSet2(this, _segmentDuration, segmentDuration);
  let segmentInfo = { id: 357149030, data: [
    { id: 2807729, data: 1e6 },
    { id: 19840, data: APP_NAME },
    { id: 22337, data: APP_NAME },
    !__privateGet2(this, _options2).streaming ? segmentDuration : null
  ] };
  __privateSet2(this, _segmentInfo, segmentInfo);
};
_createTracks = new WeakSet;
createTracks_fn = function() {
  let tracksElement = { id: 374648427, data: [] };
  __privateSet2(this, _tracksElement, tracksElement);
  if (__privateGet2(this, _options2).video) {
    tracksElement.data.push({ id: 174, data: [
      { id: 215, data: VIDEO_TRACK_NUMBER },
      { id: 29637, data: VIDEO_TRACK_NUMBER },
      { id: 131, data: VIDEO_TRACK_TYPE },
      { id: 134, data: __privateGet2(this, _options2).video.codec },
      __privateGet2(this, _videoCodecPrivate),
      __privateGet2(this, _options2).video.frameRate ? { id: 2352003, data: 1e9 / __privateGet2(this, _options2).video.frameRate } : null,
      { id: 224, data: [
        { id: 176, data: __privateGet2(this, _options2).video.width },
        { id: 186, data: __privateGet2(this, _options2).video.height },
        __privateGet2(this, _options2).video.alpha ? { id: 21440, data: 1 } : null,
        __privateGet2(this, _colourElement)
      ] }
    ] });
  }
  if (__privateGet2(this, _options2).audio) {
    __privateSet2(this, _audioCodecPrivate, __privateGet2(this, _options2).streaming ? __privateGet2(this, _audioCodecPrivate) || null : { id: 236, size: 4, data: new Uint8Array(CODEC_PRIVATE_MAX_SIZE) });
    tracksElement.data.push({ id: 174, data: [
      { id: 215, data: AUDIO_TRACK_NUMBER },
      { id: 29637, data: AUDIO_TRACK_NUMBER },
      { id: 131, data: AUDIO_TRACK_TYPE },
      { id: 134, data: __privateGet2(this, _options2).audio.codec },
      __privateGet2(this, _audioCodecPrivate),
      { id: 225, data: [
        { id: 181, data: new EBMLFloat32(__privateGet2(this, _options2).audio.sampleRate) },
        { id: 159, data: __privateGet2(this, _options2).audio.numberOfChannels },
        __privateGet2(this, _options2).audio.bitDepth ? { id: 25188, data: __privateGet2(this, _options2).audio.bitDepth } : null
      ] }
    ] });
  }
  if (__privateGet2(this, _options2).subtitles) {
    tracksElement.data.push({ id: 174, data: [
      { id: 215, data: SUBTITLE_TRACK_NUMBER },
      { id: 29637, data: SUBTITLE_TRACK_NUMBER },
      { id: 131, data: SUBTITLE_TRACK_TYPE },
      { id: 134, data: __privateGet2(this, _options2).subtitles.codec },
      __privateGet2(this, _subtitleCodecPrivate)
    ] });
  }
};
_createSegment = new WeakSet;
createSegment_fn = function() {
  let segment = {
    id: 408125543,
    size: __privateGet2(this, _options2).streaming ? -1 : SEGMENT_SIZE_BYTES,
    data: [
      !__privateGet2(this, _options2).streaming ? __privateGet2(this, _seekHead) : null,
      __privateGet2(this, _segmentInfo),
      __privateGet2(this, _tracksElement)
    ]
  };
  __privateSet2(this, _segment, segment);
  __privateGet2(this, _writer2).writeEBML(segment);
  if (__privateGet2(this, _writer2) instanceof BaseStreamTargetWriter && __privateGet2(this, _writer2).target.options.onHeader) {
    let { data, start } = __privateGet2(this, _writer2).getTrackedWrites();
    __privateGet2(this, _writer2).target.options.onHeader(data, start);
  }
};
_createCues = new WeakSet;
createCues_fn = function() {
  __privateSet2(this, _cues, { id: 475249515, data: [] });
};
_maybeFlushStreamingTargetWriter2 = new WeakSet;
maybeFlushStreamingTargetWriter_fn2 = function() {
  if (__privateGet2(this, _writer2) instanceof StreamTargetWriter2) {
    __privateGet2(this, _writer2).flush();
  }
};
_segmentDataOffset = new WeakSet;
segmentDataOffset_get = function() {
  return __privateGet2(this, _writer2).dataOffsets.get(__privateGet2(this, _segment));
};
_writeVideoDecoderConfig = new WeakSet;
writeVideoDecoderConfig_fn = function(meta) {
  if (!meta.decoderConfig)
    return;
  if (meta.decoderConfig.colorSpace) {
    let colorSpace = meta.decoderConfig.colorSpace;
    __privateSet2(this, _colorSpace, colorSpace);
    __privateGet2(this, _colourElement).data = [
      { id: 21937, data: {
        rgb: 1,
        bt709: 1,
        bt470bg: 5,
        smpte170m: 6
      }[colorSpace.matrix] },
      { id: 21946, data: {
        bt709: 1,
        smpte170m: 6,
        "iec61966-2-1": 13
      }[colorSpace.transfer] },
      { id: 21947, data: {
        bt709: 1,
        bt470bg: 5,
        smpte170m: 6
      }[colorSpace.primaries] },
      { id: 21945, data: [1, 2][Number(colorSpace.fullRange)] }
    ];
    if (!__privateGet2(this, _options2).streaming) {
      let endPos = __privateGet2(this, _writer2).pos;
      __privateGet2(this, _writer2).seek(__privateGet2(this, _writer2).offsets.get(__privateGet2(this, _colourElement)));
      __privateGet2(this, _writer2).writeEBML(__privateGet2(this, _colourElement));
      __privateGet2(this, _writer2).seek(endPos);
    }
  }
  if (meta.decoderConfig.description) {
    if (__privateGet2(this, _options2).streaming) {
      __privateSet2(this, _videoCodecPrivate, __privateMethod2(this, _createCodecPrivateElement, createCodecPrivateElement_fn).call(this, meta.decoderConfig.description));
    } else {
      __privateMethod2(this, _writeCodecPrivate, writeCodecPrivate_fn).call(this, __privateGet2(this, _videoCodecPrivate), meta.decoderConfig.description);
    }
  }
};
_fixVP9ColorSpace = new WeakSet;
fixVP9ColorSpace_fn = function(chunk) {
  if (chunk.type !== "key")
    return;
  if (!__privateGet2(this, _colorSpace))
    return;
  let i = 0;
  if (readBits(chunk.data, 0, 2) !== 2)
    return;
  i += 2;
  let profile = (readBits(chunk.data, i + 1, i + 2) << 1) + readBits(chunk.data, i + 0, i + 1);
  i += 2;
  if (profile === 3)
    i++;
  let showExistingFrame = readBits(chunk.data, i + 0, i + 1);
  i++;
  if (showExistingFrame)
    return;
  let frameType = readBits(chunk.data, i + 0, i + 1);
  i++;
  if (frameType !== 0)
    return;
  i += 2;
  let syncCode = readBits(chunk.data, i + 0, i + 24);
  i += 24;
  if (syncCode !== 4817730)
    return;
  if (profile >= 2)
    i++;
  let colorSpaceID = {
    rgb: 7,
    bt709: 2,
    bt470bg: 1,
    smpte170m: 3
  }[__privateGet2(this, _colorSpace).matrix];
  writeBits(chunk.data, i + 0, i + 3, colorSpaceID);
};
_writeSubtitleChunks = new WeakSet;
writeSubtitleChunks_fn = function() {
  let lastWrittenMediaTimestamp = Math.min(__privateGet2(this, _options2).video ? __privateGet2(this, _lastVideoTimestamp) : Infinity, __privateGet2(this, _options2).audio ? __privateGet2(this, _lastAudioTimestamp) : Infinity);
  let queue = __privateGet2(this, _subtitleChunkQueue);
  while (queue.length > 0 && queue[0].timestamp <= lastWrittenMediaTimestamp) {
    __privateMethod2(this, _writeBlock, writeBlock_fn).call(this, queue.shift(), !__privateGet2(this, _options2).video && !__privateGet2(this, _options2).audio);
  }
};
_createInternalChunk = new WeakSet;
createInternalChunk_fn = function(data, type, timestamp, trackNumber, duration, additions) {
  let adjustedTimestamp = __privateMethod2(this, _validateTimestamp2, validateTimestamp_fn2).call(this, timestamp, trackNumber);
  let internalChunk = {
    data,
    additions,
    type,
    timestamp: adjustedTimestamp,
    duration,
    trackNumber
  };
  return internalChunk;
};
_validateTimestamp2 = new WeakSet;
validateTimestamp_fn2 = function(timestamp, trackNumber) {
  let lastTimestamp = trackNumber === VIDEO_TRACK_NUMBER ? __privateGet2(this, _lastVideoTimestamp) : trackNumber === AUDIO_TRACK_NUMBER ? __privateGet2(this, _lastAudioTimestamp) : __privateGet2(this, _lastSubtitleTimestamp);
  if (trackNumber !== SUBTITLE_TRACK_NUMBER) {
    let firstTimestamp = trackNumber === VIDEO_TRACK_NUMBER ? __privateGet2(this, _firstVideoTimestamp) : __privateGet2(this, _firstAudioTimestamp);
    if (__privateGet2(this, _options2).firstTimestampBehavior === "strict" && lastTimestamp === -1 && timestamp !== 0) {
      throw new Error(`The first chunk for your media track must have a timestamp of 0 (received ${timestamp}). Non-zero first timestamps are often caused by directly piping frames or audio data from a MediaStreamTrack into the encoder. Their timestamps are typically relative to the age of the document, which is probably what you want.

If you want to offset all timestamps of a track such that the first one is zero, set firstTimestampBehavior: 'offset' in the options.
If you want to allow non-zero first timestamps, set firstTimestampBehavior: 'permissive'.
`);
    } else if (__privateGet2(this, _options2).firstTimestampBehavior === "offset") {
      timestamp -= firstTimestamp;
    }
  }
  if (timestamp < lastTimestamp) {
    throw new Error(`Timestamps must be monotonically increasing (went from ${lastTimestamp} to ${timestamp}).`);
  }
  if (timestamp < 0) {
    throw new Error(`Timestamps must be non-negative (received ${timestamp}).`);
  }
  return timestamp;
};
_writeBlock = new WeakSet;
writeBlock_fn = function(chunk, canCreateNewCluster) {
  if (__privateGet2(this, _options2).streaming && !__privateGet2(this, _tracksElement)) {
    __privateMethod2(this, _createTracks, createTracks_fn).call(this);
    __privateMethod2(this, _createSegment, createSegment_fn).call(this);
  }
  let msTimestamp = Math.floor(chunk.timestamp / 1000);
  let relativeTimestamp = msTimestamp - __privateGet2(this, _currentClusterTimestamp);
  let shouldCreateNewClusterFromKeyFrame = canCreateNewCluster && chunk.type === "key" && relativeTimestamp >= 1000;
  let clusterWouldBeTooLong = relativeTimestamp >= MAX_CHUNK_LENGTH_MS;
  if (!__privateGet2(this, _currentCluster) || shouldCreateNewClusterFromKeyFrame || clusterWouldBeTooLong) {
    __privateMethod2(this, _createNewCluster, createNewCluster_fn).call(this, msTimestamp);
    relativeTimestamp = 0;
  }
  if (relativeTimestamp < 0) {
    return;
  }
  let prelude = new Uint8Array(4);
  let view2 = new DataView(prelude.buffer);
  view2.setUint8(0, 128 | chunk.trackNumber);
  view2.setInt16(1, relativeTimestamp, false);
  if (chunk.duration === undefined && !chunk.additions) {
    view2.setUint8(3, Number(chunk.type === "key") << 7);
    let simpleBlock = { id: 163, data: [
      prelude,
      chunk.data
    ] };
    __privateGet2(this, _writer2).writeEBML(simpleBlock);
  } else {
    let msDuration = Math.floor(chunk.duration / 1000);
    let blockGroup = { id: 160, data: [
      { id: 161, data: [
        prelude,
        chunk.data
      ] },
      chunk.duration !== undefined ? { id: 155, data: msDuration } : null,
      chunk.additions ? { id: 30113, data: chunk.additions } : null
    ] };
    __privateGet2(this, _writer2).writeEBML(blockGroup);
  }
  __privateSet2(this, _duration, Math.max(__privateGet2(this, _duration), msTimestamp));
};
_createCodecPrivateElement = new WeakSet;
createCodecPrivateElement_fn = function(data) {
  return { id: 25506, size: 4, data: new Uint8Array(data) };
};
_writeCodecPrivate = new WeakSet;
writeCodecPrivate_fn = function(element, data) {
  let endPos = __privateGet2(this, _writer2).pos;
  __privateGet2(this, _writer2).seek(__privateGet2(this, _writer2).offsets.get(element));
  let codecPrivateElementSize = 2 + 4 + data.byteLength;
  let voidDataSize = CODEC_PRIVATE_MAX_SIZE - codecPrivateElementSize;
  if (voidDataSize < 0) {
    let newByteLength = data.byteLength + voidDataSize;
    if (data instanceof ArrayBuffer) {
      data = data.slice(0, newByteLength);
    } else {
      data = data.buffer.slice(0, newByteLength);
    }
    voidDataSize = 0;
  }
  element = [
    __privateMethod2(this, _createCodecPrivateElement, createCodecPrivateElement_fn).call(this, data),
    { id: 236, size: 4, data: new Uint8Array(voidDataSize) }
  ];
  __privateGet2(this, _writer2).writeEBML(element);
  __privateGet2(this, _writer2).seek(endPos);
};
_createNewCluster = new WeakSet;
createNewCluster_fn = function(timestamp) {
  if (__privateGet2(this, _currentCluster)) {
    __privateMethod2(this, _finalizeCurrentCluster, finalizeCurrentCluster_fn).call(this);
  }
  if (__privateGet2(this, _writer2) instanceof BaseStreamTargetWriter && __privateGet2(this, _writer2).target.options.onCluster) {
    __privateGet2(this, _writer2).startTrackingWrites();
  }
  __privateSet2(this, _currentCluster, {
    id: 524531317,
    size: __privateGet2(this, _options2).streaming ? -1 : CLUSTER_SIZE_BYTES,
    data: [
      { id: 231, data: timestamp }
    ]
  });
  __privateGet2(this, _writer2).writeEBML(__privateGet2(this, _currentCluster));
  __privateSet2(this, _currentClusterTimestamp, timestamp);
  let clusterOffsetFromSegment = __privateGet2(this, _writer2).offsets.get(__privateGet2(this, _currentCluster)) - __privateGet2(this, _segmentDataOffset, segmentDataOffset_get);
  __privateGet2(this, _cues).data.push({ id: 187, data: [
    { id: 179, data: timestamp },
    __privateGet2(this, _options2).video ? { id: 183, data: [
      { id: 247, data: VIDEO_TRACK_NUMBER },
      { id: 241, data: clusterOffsetFromSegment }
    ] } : null,
    __privateGet2(this, _options2).audio ? { id: 183, data: [
      { id: 247, data: AUDIO_TRACK_NUMBER },
      { id: 241, data: clusterOffsetFromSegment }
    ] } : null
  ] });
};
_finalizeCurrentCluster = new WeakSet;
finalizeCurrentCluster_fn = function() {
  if (!__privateGet2(this, _options2).streaming) {
    let clusterSize = __privateGet2(this, _writer2).pos - __privateGet2(this, _writer2).dataOffsets.get(__privateGet2(this, _currentCluster));
    let endPos = __privateGet2(this, _writer2).pos;
    __privateGet2(this, _writer2).seek(__privateGet2(this, _writer2).offsets.get(__privateGet2(this, _currentCluster)) + 4);
    __privateGet2(this, _writer2).writeEBMLVarInt(clusterSize, CLUSTER_SIZE_BYTES);
    __privateGet2(this, _writer2).seek(endPos);
  }
  if (__privateGet2(this, _writer2) instanceof BaseStreamTargetWriter && __privateGet2(this, _writer2).target.options.onCluster) {
    let { data, start } = __privateGet2(this, _writer2).getTrackedWrites();
    __privateGet2(this, _writer2).target.options.onCluster(data, start, __privateGet2(this, _currentClusterTimestamp));
  }
};
_ensureNotFinalized2 = new WeakSet;
ensureNotFinalized_fn2 = function() {
  if (__privateGet2(this, _finalized2)) {
    throw new Error("Cannot add new video or audio chunks after the file has been finalized.");
  }
};
var timestampRegex = /(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})/;
var textEncoder = new TextEncoder;
var _options22;
var _config;
var _preambleSeen;
var _preambleBytes;
var _preambleEmitted;
var _parseTimestamp;
var parseTimestamp_fn;
var _formatTimestamp;
var formatTimestamp_fn;
_options22 = new WeakMap;
_config = new WeakMap;
_preambleSeen = new WeakMap;
_preambleBytes = new WeakMap;
_preambleEmitted = new WeakMap;
_parseTimestamp = new WeakSet;
parseTimestamp_fn = function(string) {
  let match = timestampRegex.exec(string);
  if (!match)
    throw new Error("Expected match.");
  return 60 * 60 * 1000 * Number(match[1] || "0") + 60 * 1000 * Number(match[2]) + 1000 * Number(match[3]) + Number(match[4]);
};
_formatTimestamp = new WeakSet;
formatTimestamp_fn = function(timestamp) {
  let hours = Math.floor(timestamp / (60 * 60 * 1000));
  let minutes = Math.floor(timestamp % (60 * 60 * 1000) / (60 * 1000));
  let seconds = Math.floor(timestamp % (60 * 1000) / 1000);
  let milliseconds = timestamp % 1000;
  return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0") + "." + milliseconds.toString().padStart(3, "0");
};

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
  cover: { frameTime: 0, templateId: "impact--cyber", duration: 3, useAI: true, mode: "auto", bgStyle: "adegan", bgScope: "sama" },
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
    const subSz = td.subSize && td.subSize > 0 ? td.subSize * h : sz * 0.42;
    let subs2 = [];
    if (td.sub) {
      ctx.font = `600 ${subSz}px ${fontStack(td.subFont || "sans")}`;
      subs2 = wrapCanvasText(ctx, td.sub, maxW);
    }
    const lh = sz * 1.12;
    const bh = ls.length * lh + (subs2.length ? subs2.length * subSz * 1.3 + subSz * 0.25 : 0);
    return { ls, subs: subs2, subSz, lineH: lh, blockH: bh };
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
  const posYBase = td.pos === "top" ? h * 0.16 + blockH / 2 : td.pos === "center" ? h / 2 : h * 0.86 - blockH / 2;
  const posY = posYBase + offY;
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
        subOffY: pct(texts.descY)
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
        offY: pct(texts.partY)
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

// src/lib/editor/fonts.ts
var FONT_FILES = [
  { family: "Orbitron", weight: "900", file: "Orbitron-900.ttf" },
  { family: "Anton", weight: "400", file: "Anton-Regular.ttf" },
  { family: "Bebas Neue", weight: "400", file: "BebasNeue-Regular.ttf" },
  { family: "Rajdhani", weight: "700", file: "Rajdhani-700.ttf" },
  { family: "Playfair Display", weight: "800", file: "PlayfairDisplay-800.ttf" },
  { family: "Montserrat", weight: "800", file: "Montserrat-800.ttf" },
  { family: "Oswald", weight: "600", file: "Oswald-600.ttf" },
  { family: "Archivo Black", weight: "400", file: "ArchivoBlack-Regular.ttf" },
  { family: "Barlow Condensed", weight: "600", file: "BarlowCondensed-600.ttf" },
  { family: "Cinzel", weight: "700", file: "Cinzel-700.ttf" },
  { family: "Teko", weight: "700", file: "Teko-700.ttf" },
  { family: "Russo One", weight: "400", file: "RussoOne-Regular.ttf" },
  { family: "Michroma", weight: "400", file: "Michroma-Regular.ttf" },
  { family: "Italiana", weight: "400", file: "Italiana-Regular.ttf" },
  { family: "Righteous", weight: "400", file: "Righteous-Regular.ttf" },
  { family: "Alfa Slab One", weight: "400", file: "AlfaSlabOne-Regular.ttf" }
];
var loader = null;
function ensureAppFonts() {
  if (typeof window === "undefined")
    return Promise.resolve();
  if (!loader) {
    loader = (async () => {
      try {
        const base = document.baseURI;
        const jobs = [];
        for (const f of FONT_FILES) {
          try {
            const url2 = new URL(`fonts/${f.file}`, base).href;
            const ff = new FontFace(f.family, `url(${url2})`, { weight: f.weight, display: "swap" });
            document.fonts.add(ff);
            jobs.push(ff.load());
          } catch {}
        }
        await Promise.allSettled(jobs);
        await document.fonts.ready;
      } catch {}
    })();
  }
  return loader;
}

// src/lib/editor/fsBridge.ts
class DiskFileWriter {
  id;
  constructor(id) {
    this.id = id;
  }
  bytes = 0;
  static async begin(dir, name) {
    if (!window.novacutFS?.saveFileBegin || !window.novacutFS.saveFileChunk || !window.novacutFS.saveFileEnd)
      return null;
    try {
      const res = await window.novacutFS.saveFileBegin(dir, name);
      if (res.ok && res.id)
        return new DiskFileWriter(res.id);
      return null;
    } catch {
      return null;
    }
  }
  async write(data, position) {
    const buf = data instanceof ArrayBuffer ? data : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    this.bytes = Math.max(this.bytes, (typeof position === "number" ? position : this.bytes) + buf.byteLength);
    const res = await window.novacutFS.saveFileChunk(this.id, buf, position);
    if (!res.ok)
      throw new Error(res.error || "Gagal menulis potongan file");
  }
  async finish() {
    const res = await window.novacutFS.saveFileEnd(this.id);
    if (!res.ok || !res.path)
      throw new Error(res.error || "Gagal menutup file");
    return res.path;
  }
  async abort() {
    try {
      await window.novacutFS?.saveFileEnd?.(this.id);
    } catch {}
  }
}

// src/lib/editor/fastExport.ts
var sleep2 = (ms) => new Promise((r) => setTimeout(r, ms));
var clamp2 = (v, a, b) => Math.max(a, Math.min(b, v));
var supportCache = null;
function fastSupported() {
  if (!supportCache)
    supportCache = probe();
  return supportCache;
}
async function probe() {
  try {
    if (typeof VideoEncoder === "undefined" || typeof VideoFrame === "undefined")
      return null;
    const w = 1280;
    const h = 720;
    const vCandidates = [
      { codec: "avc1.42E01E", mux: "avc" },
      { codec: "avc1.4D0028", mux: "avc" },
      { codec: "avc1.640028", mux: "avc" },
      { codec: "vp09.00.10.08", mux: "vp9" }
    ];
    let video = null;
    for (const c of vCandidates) {
      try {
        const s = await VideoEncoder.isConfigSupported({ codec: c.codec, width: w, height: h, bitrate: 8000000, framerate: 30 });
        if (s.supported) {
          video = c;
          break;
        }
      } catch {}
    }
    if (!video)
      return null;
    let audioCodec = null;
    if (typeof AudioEncoder !== "undefined" && typeof AudioData !== "undefined") {
      for (const codec of ["mp4a.40.2", "opus"]) {
        try {
          const s = await AudioEncoder.isConfigSupported({ codec, sampleRate: 48000, numberOfChannels: 2, bitrate: 192000 });
          if (s.supported) {
            audioCodec = codec;
            break;
          }
        } catch {}
      }
    }
    if (video.mux === "avc") {
      return { videoCodec: video.codec, videoMuxCodec: "avc", audioCodec, container: "mp4", ext: ".mp4" };
    }
    return { videoCodec: video.codec, videoMuxCodec: "vp9", audioCodec: audioCodec === "mp4a.40.2" ? "opus" : audioCodec, container: "webm", ext: ".webm" };
  } catch {
    return null;
  }
}

class AudioDecodeCache {
  ctx;
  map = new Map;
  inflight = new Map;
  constructor(ctx) {
    this.ctx = ctx;
  }
  async get(assetId, url2) {
    const hit = this.map.get(assetId);
    if (hit)
      return hit;
    const running = this.inflight.get(assetId);
    if (running)
      return running;
    const job = (async () => {
      let src = { mono: null, buffer: null, sampleRate: this.ctx.sampleRate };
      try {
        const res = await fetch(url2);
        const ab = await res.arrayBuffer();
        const buf = await this.ctx.decodeAudioData(ab);
        const n = buf.length;
        const mono = new Float32Array(n);
        const c0 = buf.getChannelData(0);
        const c1 = buf.numberOfChannels > 1 ? buf.getChannelData(1) : null;
        if (c1) {
          for (let i = 0;i < n; i++)
            mono[i] = (c0[i] + c1[i]) * 0.5;
        } else {
          mono.set(c0);
        }
        src = { mono, buffer: null, sampleRate: buf.sampleRate };
      } catch {
        src = { mono: null, buffer: null, sampleRate: this.ctx.sampleRate };
      }
      this.map.set(assetId, src);
      return src;
    })();
    this.inflight.set(assetId, job);
    try {
      return await job;
    } finally {
      this.inflight.delete(assetId);
    }
  }
  dispose() {
    this.map.clear();
    this.inflight.clear();
  }
}
var DISK_CHUNK = 8 * 1024 * 1024;

class DiskWriteChain {
  w;
  chain = Promise.resolve();
  err = null;
  constructor(w) {
    this.w = w;
  }
  onData = (data, position) => {
    if (this.err)
      return;
    this.chain = this.chain.then(() => this.w.write(data, position)).catch((e) => {
      this.err ??= e instanceof Error ? e : new Error(String(e));
    });
  };
  async flush() {
    await this.chain;
    if (this.err)
      throw this.err;
  }
}
function clipVolume(clip, track, local) {
  const fi = clip.fadeIn > 0 ? clamp2(local / clip.fadeIn, 0, 1) : 1;
  const fo = clip.fadeOut > 0 ? clamp2((clip.duration - local) / clip.fadeOut, 0, 1) : 1;
  const vol = typeof clip.volume === "number" && isFinite(clip.volume) ? clip.volume : 1;
  return vol * (track?.muted ? 0 : 1) * Math.min(fi, fo);
}
function srcTimeOf(clip, t) {
  const local = t - clip.start;
  const srcSeg = clip.duration * clip.speed / Math.max(1, clip.loopCount);
  return clip.inPoint + local * clip.speed % Math.max(0.033, srcSeg);
}
async function encodeAudioRange(muxer, audioCodec, opts, decodeCache, rs, sampleRate = 48000) {
  const { start, end } = opts;
  const dur = Math.max(0.05, end - start);
  const contributors = [];
  for (const clip of rs.clips) {
    if (clip.kind !== "video" && clip.kind !== "audio")
      continue;
    const track = rs.tracks.find((tr) => tr.id === clip.trackId);
    if (track?.hidden)
      continue;
    const asset = rs.assets.find((a) => a.id === clip.assetId);
    if (!asset)
      continue;
    if (asset.musicId) {
      const def = musicDefById(asset.musicId);
      if (!def)
        continue;
      try {
        const buf = await getMusicBuffer(def);
        contributors.push({ kind: "music", clip, track, src: { mono: null, buffer: buf, sampleRate: buf.sampleRate } });
      } catch {}
    } else {
      const src = await decodeCache.get(asset.id, asset.url);
      if (src.mono || src.buffer)
        contributors.push({ kind: "media", clip, track, src });
    }
  }
  const mix = contributors.map((c) => {
    const b = c.src.buffer;
    const ch0 = c.src.mono ?? b.getChannelData(0);
    const ch1 = c.src.mono ?? (b.numberOfChannels > 1 ? b.getChannelData(1) : b.getChannelData(0));
    const sr = c.src.sampleRate;
    const bufDur = c.src.mono ? c.src.mono.length / Math.max(1, sr) : b?.duration ?? 0;
    return { clip: c.clip, track: c.track, kind: c.kind, ch0, ch1, sr, bufDur };
  });
  const encoder = new AudioEncoder({
    output: (chunk, meta) => {
      muxer.addAudioChunk(chunk, meta);
    },
    error: () => {}
  });
  encoder.configure({ codec: audioCodec, sampleRate, numberOfChannels: 2, bitrate: 192000 });
  const win = 4096;
  const totalSamples = Math.ceil(dur * sampleRate);
  const l = new Float32Array(win);
  const r = new Float32Array(win);
  for (let off = 0;off < totalSamples; off += win) {
    const n = Math.min(win, totalSamples - off);
    l.fill(0);
    r.fill(0);
    for (let i = 0;i < n; i++) {
      const t = start + (off + i) / sampleRate;
      for (const m of mix) {
        const clip = m.clip;
        if (t < clip.start || t >= clip.start + clip.duration)
          continue;
        const local = t - clip.start;
        const v = clipVolume(clip, m.track, local);
        if (v <= 0)
          continue;
        let srcPos;
        if (m.kind === "media") {
          srcPos = srcTimeOf(clip, t);
        } else {
          srcPos = local % Math.max(0.016, m.bufDur);
        }
        const idx = srcPos * m.sr;
        const i0 = Math.floor(idx);
        const frac = idx - i0;
        const s0 = i0 >= 0 && i0 < m.ch0.length ? m.ch0[i0] : 0;
        const s0b = i0 + 1 < m.ch0.length ? m.ch0[i0 + 1] : s0;
        const s1 = i0 >= 0 && i0 < m.ch1.length ? m.ch1[i0] : 0;
        const s1b = i0 + 1 < m.ch1.length ? m.ch1[i0 + 1] : s1;
        l[i] += (s0 + (s0b - s0) * frac) * v;
        r[i] += (s1 + (s1b - s1) * frac) * v;
      }
    }
    const data = new Float32Array(n * 2);
    for (let i = 0;i < n; i++) {
      data[i * 2] = clamp2(l[i], -1, 1);
      data[i * 2 + 1] = clamp2(r[i], -1, 1);
    }
    const ad = new AudioData({
      format: "f32",
      sampleRate,
      numberOfFrames: n,
      numberOfChannels: 2,
      timestamp: Math.round(off / sampleRate * 1e6),
      data
    });
    encoder.encode(ad);
    ad.close();
    if (encoder.encodeQueueSize > 24)
      await sleep2(2);
  }
  await encoder.flush();
  encoder.close();
}

// src/lib/editor/mp4Demux.ts
function headIsMp4(head) {
  if (head.length < 12)
    return false;
  return head[4] === 102 && head[5] === 116 && head[6] === 121 && head[7] === 112;
}
async function readBytes(blob, off, len) {
  const end = Math.min(blob.size, off + len);
  if (off >= end)
    return new Uint8Array(0);
  const buf = await blob.slice(off, end).arrayBuffer();
  return new Uint8Array(buf);
}
var hex2 = (v) => v.toString(16).toUpperCase().padStart(2, "0");
function fourCC(dv, o) {
  return String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
}
function children(dv, from, to) {
  const out = [];
  let o = from;
  while (o + 8 <= to) {
    let size = dv.getUint32(o);
    const type = fourCC(dv, o + 4);
    let hdr = 8;
    if (size === 1) {
      if (o + 16 > to)
        break;
      size = dv.getUint32(o + 8) * 4294967296 + dv.getUint32(o + 12);
      hdr = 16;
    } else if (size === 0) {
      size = to - o;
    }
    if (size < hdr || o + size > to + 1)
      break;
    out.push({ type, start: o, body: o + hdr, bodyLen: size - hdr });
    o += size;
  }
  return out;
}
function descLen(dv, o) {
  let len = 0;
  let p = o;
  for (let i = 0;i < 4; i++) {
    const b = dv.getUint8(p++);
    len = len << 7 | b & 127;
    if (!(b & 128))
      break;
  }
  return { len, next: p };
}
function parseEsds(dv, body, len) {
  const to = body + len;
  let oti = null;
  let asc = null;
  let o = body + 4;
  if (o >= to || dv.getUint8(o) !== 3)
    return { oti, asc };
  const es = descLen(dv, o + 1);
  const esEnd = Math.min(to, es.next + es.len);
  let p = es.next;
  if (p + 3 > esEnd)
    return { oti, asc };
  p += 2;
  const flags = dv.getUint8(p);
  p += 1;
  if (flags & 128)
    p += 2;
  if (flags & 64)
    p += 2;
  if (p < esEnd && dv.getUint8(p) === 4) {
    const dcd = descLen(dv, p + 1);
    const dcdBody = dcd.next;
    const dcdEnd = Math.min(esEnd, dcdBody + dcd.len);
    if (dcdEnd - dcdBody >= 1)
      oti = dv.getUint8(dcdBody);
    let q = dcdBody + 13;
    while (q + 2 <= dcdEnd) {
      const tag = dv.getUint8(q);
      const d = descLen(dv, q + 1);
      if (tag === 5) {
        asc = new Uint8Array(dv.buffer.slice(dv.byteOffset + d.next, dv.byteOffset + d.next + d.len));
        break;
      }
      q = d.next + d.len;
    }
  }
  return { oti, asc };
}
function videoCodecString(mux, desc) {
  const dv = new DataView(desc.buffer, desc.byteOffset, desc.byteLength);
  switch (mux) {
    case "avc":
      if (desc.length < 4)
        return "avc1.42E01E";
      return `avc1.${hex2(desc[1])}${hex2(desc[2])}${hex2(desc[3])}`;
    case "hevc": {
      if (desc.length < 13)
        return "hvc1.1.6.L93.B0";
      const b1 = dv.getUint8(1);
      const space = b1 >> 6 & 3;
      const pidc = b1 & 31;
      const compat = dv.getUint32(2).toString(16).toUpperCase();
      let cons = "";
      for (let i = 6;i < 12; i++)
        cons += hex2(desc[i]);
      const level = dv.getUint8(12);
      return `hvc1.${space || 1}.${pidc}.${compat}.${level >= 128 ? "H" : "L"}${level & 127}.${cons}`;
    }
    case "vp9": {
      const prof = desc.length > 0 ? desc[0] : 0;
      const lvl = desc.length > 1 ? desc[1] : 10;
      const depth = desc.length > 2 ? desc[2] : 8;
      return `vp09.${hex2(prof)}.${hex2(lvl)}.${hex2(depth)}`;
    }
    case "av1": {
      if (desc.length < 4)
        return "av01.0.08M.08";
      const b1 = dv.getUint8(1);
      const prof = b1 >> 5 & 7;
      const lvl = b1 & 31;
      const b2 = dv.getUint8(2);
      const tier = b2 >> 7 & 1;
      const depth = b2 & 64 ? b2 & 32 ? 12 : 10 : 8;
      return `av01.${prof}.${hex2(lvl)}${tier ? "H" : "M"}.${hex2(depth)}`;
    }
  }
}
function parseSampleEntry(dv, eStart, eSize, kind) {
  const meta = { codec: "", width: 0, height: 0, channels: 0, sampleRate: 0 };
  const childFrom = eStart + (kind === "video" ? 86 : 36);
  if (kind === "video") {
    meta.width = dv.getUint16(eStart + 32);
    meta.height = dv.getUint16(eStart + 34);
  } else {
    meta.channels = dv.getUint16(eStart + 24) || 2;
    meta.sampleRate = Math.round(dv.getUint32(eStart + 32) / 65536) || 48000;
  }
  const kids = children(dv, childFrom, eStart + eSize);
  for (const k of kids) {
    if (k.type === "avcC" || k.type === "hvcC" || k.type === "vpcC" || k.type === "av1C") {
      meta.description = new Uint8Array(dv.buffer.slice(dv.byteOffset + k.body, dv.byteOffset + k.body + k.bodyLen));
      meta.videoMux = k.type === "avcC" ? "avc" : k.type === "hvcC" ? "hevc" : k.type === "vpcC" ? "vp9" : "av1";
      meta.codec = videoCodecString(meta.videoMux, meta.description);
    } else if (k.type === "esds") {
      const { oti, asc } = parseEsds(dv, k.body, k.bodyLen);
      meta.description = asc ?? undefined;
      meta.codec = oti !== null && (oti === 64 || oti === 102 || oti === 103 || oti === 104) ? "mp4a.40.2" : "";
    }
  }
  if (!meta.codec)
    meta.codec = fourCC(dv, eStart + 4);
  return meta;
}
async function parseMp4(blob) {
  let moov2 = null;
  let off = 0;
  const size = blob.size;
  while (off + 8 <= size) {
    const head = await readBytes(blob, off, 16);
    if (head.length < 8)
      break;
    const hv = new DataView(head.buffer, head.byteOffset, head.byteLength);
    let sz = hv.getUint32(0);
    const type = fourCC(hv, 4);
    let hdr = 8;
    if (sz === 1) {
      if (head.length < 16)
        break;
      sz = hv.getUint32(8) * 4294967296 + hv.getUint32(12);
      hdr = 16;
    } else if (sz === 0) {
      sz = size - off;
    }
    if (sz < hdr)
      break;
    if (type === "moov") {
      moov2 = { body: off + hdr, bodyLen: Math.min(sz - hdr, size - off - hdr) };
      break;
    }
    off += sz;
  }
  if (!moov2)
    throw new Error("moov tidak ditemukan — bukan MP4 valid");
  const moovBuf = await blob.slice(moov2.body, moov2.body + moov2.bodyLen).arrayBuffer();
  const mv = new DataView(moovBuf);
  const mvBoxes = children(mv, 0, moovBuf.byteLength);
  const tracks = [];
  for (const trak2 of mvBoxes.filter((b) => b.type === "trak")) {
    try {
      const kids = children(mv, trak2.body, trak2.body + trak2.bodyLen);
      const mdia2 = kids.find((b) => b.type === "mdia");
      if (!mdia2)
        continue;
      const mdiaKids = children(mv, mdia2.body, mdia2.body + mdia2.bodyLen);
      const mdhd2 = mdiaKids.find((b) => b.type === "mdhd");
      const hdlr2 = mdiaKids.find((b) => b.type === "hdlr");
      const minf2 = mdiaKids.find((b) => b.type === "minf");
      if (!mdhd2 || !hdlr2 || !minf2)
        continue;
      const handler = fourCC(mv, hdlr2.body + 8);
      if (handler !== "vide" && handler !== "soun")
        continue;
      const kind = handler === "vide" ? "video" : "audio";
      const v1 = mv.getUint8(mdhd2.body) === 1;
      const timescale = mv.getUint32(mdhd2.body + (v1 ? 20 : 12));
      const durRaw = v1 ? Number(mv.getBigUint64(mdhd2.body + 24)) : mv.getUint32(mdhd2.body + 16);
      if (!timescale)
        continue;
      const duration = durRaw / timescale;
      const stbl2 = children(mv, minf2.body, minf2.body + minf2.bodyLen).find((b) => b.type === "stbl");
      if (!stbl2)
        continue;
      const sb = children(mv, stbl2.body, stbl2.body + stbl2.bodyLen);
      const stsd2 = sb.find((b) => b.type === "stsd");
      const stts2 = sb.find((b) => b.type === "stts");
      const stsc2 = sb.find((b) => b.type === "stsc");
      const stsz2 = sb.find((b) => b.type === "stsz");
      const stco2 = sb.find((b) => b.type === "stco");
      const co64 = sb.find((b) => b.type === "co64");
      const stss2 = sb.find((b) => b.type === "stss");
      if (!stsd2 || !stts2 || !stsc2 || !stsz2 || !stco2 && !co64)
        continue;
      const entryCount = mv.getUint32(stsd2.body + 4);
      if (entryCount < 1)
        continue;
      const firstEntry = stsd2.body + 8;
      const eSize = mv.getUint32(firstEntry);
      const eType = fourCC(mv, firstEntry + 4);
      if (kind === "video" && !["avc1", "avc2", "avc3", "avc4", "hvc1", "hev1", "vp09", "av01"].includes(eType))
        continue;
      if (kind === "audio" && eType !== "mp4a")
        continue;
      const em = parseSampleEntry(mv, firstEntry, Math.min(eSize, stsd2.body + stsd2.bodyLen - firstEntry), kind);
      if (kind === "video" && !em.videoMux)
        continue;
      const nStts = mv.getUint32(stts2.body + 4);
      let dtsList = new Float64Array(1 << 16);
      let nSamples = 0;
      let dts = 0;
      for (let i = 0;i < nStts; i++) {
        const p = stts2.body + 8 + i * 8;
        const count = mv.getUint32(p);
        const delta = mv.getUint32(p + 4);
        for (let c = 0;c < count; c++) {
          if (nSamples === dtsList.length) {
            const bigger = new Float64Array(dtsList.length * 2);
            bigger.set(dtsList);
            dtsList = bigger;
          }
          dtsList[nSamples++] = dts;
          dts += delta;
        }
      }
      if (!nSamples)
        continue;
      const ctsList = new Float64Array(nSamples);
      ctsList.set(dtsList.subarray(0, nSamples));
      const ctts2 = sb.find((b) => b.type === "ctts");
      if (ctts2) {
        const nCtts = mv.getUint32(ctts2.body + 4);
        let idx = 0;
        for (let i = 0;i < nCtts && idx < nSamples; i++) {
          const p = ctts2.body + 8 + i * 8;
          const count = mv.getUint32(p);
          const offRaw = mv.getInt32(p + 4);
          for (let c = 0;c < count && idx < nSamples; c++, idx++)
            ctsList[idx] = dtsList[idx] + offRaw;
        }
      }
      const sync = new Uint8Array(nSamples).fill(1);
      if (stss2) {
        sync.fill(0);
        const nSync = mv.getUint32(stss2.body + 4);
        for (let i = 0;i < nSync; i++) {
          const s = mv.getUint32(stss2.body + 8 + i * 4);
          if (s >= 1 && s <= nSamples)
            sync[s - 1] = 1;
        }
      }
      const uniformSize = mv.getUint32(stsz2.body + 4);
      const sampleSize = (i) => uniformSize ? uniformSize : mv.getUint32(stsz2.body + 12 + i * 4);
      const nChunk = stco2 ? mv.getUint32(stco2.body + 4) : mv.getUint32(co64.body + 4);
      const chunkOff = (ci) => stco2 ? mv.getUint32(stco2.body + 8 + ci * 4) : Number(mv.getBigUint64(co64.body + 8 + ci * 8));
      const nStsc = mv.getUint32(stsc2.body + 4);
      const samples = [];
      const ts = timescale;
      for (let run = 0;run < nStsc; run++) {
        const p = stsc2.body + 8 + run * 12;
        const firstChunk = mv.getUint32(p);
        const spc = mv.getUint32(p + 4);
        const lastChunk = run + 1 < nStsc ? mv.getUint32(stsc2.body + 8 + (run + 1) * 12) - 1 : nChunk;
        for (let ch = firstChunk;ch <= lastChunk && ch <= nChunk; ch++) {
          let o = chunkOff(ch - 1);
          for (let s = 0;s < spc && samples.length < nSamples; s++) {
            const i = samples.length;
            samples.push({ offset: o, size: sampleSize(i), dts: dtsList[i] / ts, cts: ctsList[i] / ts, sync: sync[i] === 1 });
            o += sampleSize(i);
          }
        }
      }
      if (!samples.length)
        continue;
      const tkhd2 = kids.find((b) => b.type === "tkhd");
      const trackId = tkhd2 ? mv.getUint32(tkhd2.body + (mv.getUint8(tkhd2.body) === 1 ? 20 : 12)) : tracks.length + 1;
      tracks.push({
        id: trackId,
        kind,
        codec: em.codec,
        videoMux: em.videoMux,
        description: em.description,
        width: em.width,
        height: em.height,
        channels: em.channels,
        sampleRate: em.sampleRate,
        timescale,
        duration,
        fps: kind === "video" ? samples.length / Math.max(0.1, duration) : 0,
        samples
      });
    } catch {}
  }
  return { tracks, size };
}
function keyframeIndexAt(tr, t) {
  const s = tr.samples;
  let lo = 0;
  let hi = s.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (s[mid].cts <= t + 0.02) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  let i = ans;
  while (i > 0 && !s[i].sync)
    i--;
  if (!s[i].sync) {
    i = 0;
    while (i < s.length - 1 && !s[i].sync)
      i++;
  }
  return i;
}
function firstSampleAtOrAfter(tr, t) {
  const s = tr.samples;
  let lo = 0;
  let hi = s.length;
  while (lo < hi) {
    const mid = lo + hi >> 1;
    if (s[mid].cts < t)
      lo = mid + 1;
    else
      hi = mid;
  }
  return lo;
}

// src/lib/editor/turboExport.ts
var sleep3 = (ms) => new Promise((r) => setTimeout(r, ms));
var clamp3 = (v, a, b) => Math.max(a, Math.min(b, v));
function srcTimeOf2(clip, t) {
  const local = t - clip.start;
  const srcSeg = clip.duration * clip.speed / Math.max(1, clip.loopCount);
  return clip.inPoint + local * clip.speed % Math.max(0.033, srcSeg);
}
var turboParse = new Map;
function loadMp4(asset) {
  const key = asset.url;
  let p = turboParse.get(key);
  if (!p) {
    const file = asset.file;
    p = parseMp4(file).then((info) => ({ info, file }));
    turboParse.set(key, p);
  }
  return p;
}
async function turboEligible(asset) {
  try {
    if (typeof VideoDecoder === "undefined" || typeof EncodedVideoChunk === "undefined") {
      return { ok: false, reason: "WebCodecs decoder tidak tersedia" };
    }
    if (!asset.file)
      return { ok: false, reason: "berkas sumber tidak dapat diakses" };
    const head = new Uint8Array(await asset.file.slice(0, 16).arrayBuffer());
    if (!headIsMp4(head))
      return { ok: false, reason: "bukan container MP4" };
    const { info } = await loadMp4(asset);
    const vtr = info.tracks.find((t) => t.kind === "video");
    if (!vtr || !vtr.videoMux || !vtr.description?.length)
      return { ok: false, reason: "codec video tidak didukung" };
    const sup = await VideoDecoder.isConfigSupported({ codec: vtr.codec, description: vtr.description });
    if (!sup.supported)
      return { ok: false, reason: `decoder ${vtr.codec} tidak tersedia` };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "gagal membaca berkas" };
  }
}
function audioCopyAllowed(rs, mainClip, mainAsset) {
  if (mainClip.speed !== 1 || mainClip.loopCount !== 1)
    return false;
  if (mainClip.volume !== 1 || mainClip.fadeIn > 0 || mainClip.fadeOut > 0)
    return false;
  if (mainAsset.musicId)
    return false;
  const vids = rs.clips.filter((c) => c.kind === "video");
  if (vids.length !== 1 || vids[0].id !== mainClip.id)
    return false;
  const vtr = rs.tracks.find((t) => t.id === mainClip.trackId);
  if (vtr?.muted)
    return false;
  for (const c of rs.clips) {
    if (c.kind === "audio")
      return false;
  }
  return true;
}
async function* decodeVideoRange(file, tr, startSrc, endSrc) {
  const samples = tr.samples;
  const startUs = Math.round(startSrc * 1e6) - 2000;
  const endUs = Math.round(endSrc * 1e6) + 2000;
  const pending = [];
  let err = null;
  const dec = new VideoDecoder({
    output: (f) => pending.push(f),
    error: (e) => {
      err = e instanceof Error ? e : new Error(String(e));
    }
  });
  dec.configure({
    codec: tr.codec,
    description: tr.description,
    optimizeForLatency: false
  });
  const cleanup = () => {
    try {
      if (dec.state !== "closed")
        dec.close();
    } catch {}
    for (const f of pending)
      f.close();
    pending.length = 0;
  };
  try {
    let i = keyframeIndexAt(tr, startSrc);
    let eof = i >= samples.length;
    const BATCH_BYTES = 2 * 1024 * 1024;
    while (true) {
      if (err)
        throw err;
      while (pending.length && pending[0].timestamp < startUs)
        pending.shift().close();
      if (pending.length && pending[0].timestamp >= endUs)
        break;
      if (pending.length) {
        const f = pending.shift();
        yield { frame: f, pts: f.timestamp / 1e6 };
        continue;
      }
      if (eof && dec.decodeQueueSize === 0)
        break;
      if (!eof && pending.length < 10 && dec.decodeQueueSize < 14) {
        let bytes2 = 0;
        const batch = [];
        while (i < samples.length && bytes2 < BATCH_BYTES && batch.length < 512) {
          batch.push(samples[i]);
          bytes2 += samples[i].size;
          i++;
        }
        if (!batch.length) {
          eof = true;
        } else {
          const from = batch[0].offset;
          const last2 = batch[batch.length - 1];
          const buf = new Uint8Array(await file.slice(from, last2.offset + last2.size).arrayBuffer());
          for (const s of batch) {
            const data = buf.slice(s.offset - from, s.offset - from + s.size);
            dec.decode(new EncodedVideoChunk({
              type: s.sync ? "key" : "delta",
              timestamp: Math.round(s.cts * 1e6),
              data
            }));
          }
          if (i >= samples.length)
            eof = true;
        }
      } else {
        await sleep3(2);
      }
    }
  } catch (e) {
    cleanup();
    throw e;
  }
  while (pending.length) {
    const f = pending.shift();
    if (f.timestamp < endUs)
      yield { frame: f, pts: f.timestamp / 1e6 };
    else
      f.close();
  }
  cleanup();
}
async function copyAudioRange(muxer, file, atr, srcStart, srcEnd, shiftSec) {
  const samples = atr.samples;
  if (!samples.length)
    return;
  let i0 = firstSampleAtOrAfter(atr, srcStart);
  if (i0 > 0 && samples[i0 - 1].cts < srcStart) {
    const avg = Math.max(0.001, (samples[samples.length - 1].cts - samples[0].cts) / samples.length);
    if (samples[i0 - 1].cts + avg > srcStart)
      i0--;
  }
  const avgDur = Math.max(0.001, 1024 / Math.max(8000, atr.sampleRate || 48000));
  let metaSent = false;
  const BATCH = 4 * 1024 * 1024;
  let i = i0;
  while (i < samples.length && samples[i].cts < srcEnd) {
    const batch = [];
    let bytes2 = 0;
    let j = i;
    while (j < samples.length && bytes2 < BATCH && samples[j].cts < srcEnd) {
      batch.push(samples[j]);
      bytes2 += samples[j].size;
      j++;
    }
    const from = batch[0].offset;
    const last2 = batch[batch.length - 1];
    const buf = new Uint8Array(await file.slice(from, last2.offset + last2.size).arrayBuffer());
    for (let k = 0;k < batch.length; k++) {
      const s = batch[k];
      if (s.cts >= srcEnd)
        break;
      const data = buf.slice(s.offset - from, s.offset - from + s.size);
      const ts = Math.round((shiftSec + Math.max(0, s.cts - srcStart)) * 1e6);
      const nxtCts = k + 1 < batch.length ? batch[k + 1].dts : j < samples.length ? samples[j].dts : s.dts + avgDur;
      const durUs = Math.max(1, Math.round((nxtCts - s.dts) * 1e6));
      const chunk = new EncodedAudioChunk({ type: "key", timestamp: ts, duration: durUs, data });
      muxer.addAudioChunk(chunk, metaSent ? undefined : {
        decoderConfig: {
          codec: "mp4a.40.2",
          sampleRate: atr.sampleRate,
          numberOfChannels: clamp3(atr.channels || 2, 1, 8),
          description: atr.description
        }
      });
      metaSent = true;
    }
    i = j;
  }
}
async function encodeSilence(muxer, sec) {
  if (sec <= 0.01)
    return;
  const enc = new AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: () => {}
  });
  enc.configure({ codec: "mp4a.40.2", sampleRate: 48000, numberOfChannels: 2, bitrate: 128000 });
  const win = 4096;
  const total = Math.ceil(sec * 48000);
  const data = new Float32Array(win * 2);
  for (let off = 0;off < total; off += win) {
    const n = Math.min(win, total - off);
    const ad = new AudioData({
      format: "f32",
      sampleRate: 48000,
      numberOfFrames: n,
      numberOfChannels: 2,
      timestamp: Math.round(off / 48000 * 1e6),
      data: data.subarray(0, n * 2)
    });
    enc.encode(ad);
    ad.close();
    if (enc.encodeQueueSize > 32)
      await sleep3(2);
  }
  await enc.flush();
  enc.close();
}
async function exportSegmentTurbo(opts) {
  const support = await fastSupported();
  if (!support || support.container !== "mp4")
    throw new Error("Mesin Turbo memerlukan encoder MP4 (H.264)");
  await ensureAppFonts();
  const { rs, clip, asset } = opts;
  const w = rs.project.width;
  const h = rs.project.height;
  const fps = opts.fps ?? 30;
  const contentDur = Math.max(0.1, opts.end - opts.start);
  const totalDur = opts.shift + contentDur;
  const totalFrames = Math.max(1, Math.ceil(totalDur * fps));
  const gopSize = fps * 2;
  const { info, file } = await loadMp4(asset);
  const vtr = info.tracks.find((t) => t.kind === "video" && t.videoMux);
  if (!vtr)
    throw new Error("Track video MP4 tidak ditemukan");
  const atr = info.tracks.find((t) => t.kind === "audio" && t.codec === "mp4a.40.2" && t.description?.length);
  opts.onStage?.("Menyiapkan mesin Turbo...");
  let writer = null;
  if (opts.directSave) {
    writer = await DiskFileWriter.begin(opts.directSave.dir, opts.directSave.name + ".mp4");
  }
  const useCopy = !!opts.audioCopy && !!atr;
  let muxer;
  let targetRef = null;
  let diskFlush = null;
  const audioMux = useCopy && atr ? { codec: "aac", numberOfChannels: clamp3(atr.channels || 2, 1, 8), sampleRate: atr.sampleRate } : support.audioCodec ? { codec: support.audioCodec === "mp4a.40.2" ? "aac" : "opus", numberOfChannels: 2, sampleRate: 48000 } : null;
  if (writer) {
    const flusher = new DiskWriteChain(writer);
    muxer = new Muxer({
      target: new StreamTarget({ onData: flusher.onData, chunked: true, chunkSize: DISK_CHUNK }),
      video: { codec: support.videoMuxCodec, width: w, height: h, frameRate: fps },
      ...audioMux ? { audio: audioMux } : {},
      fastStart: false,
      firstTimestampBehavior: "offset"
    });
    diskFlush = flusher;
  } else {
    targetRef = new ArrayBufferTarget;
    muxer = new Muxer({
      target: targetRef,
      video: { codec: support.videoMuxCodec, width: w, height: h, frameRate: fps },
      ...audioMux ? { audio: audioMux } : {},
      fastStart: "in-memory",
      firstTimestampBehavior: "offset"
    });
  }
  if (useCopy && atr) {
    opts.onStage?.("Menyalin audio asli (stream-copy)...");
    if (opts.shift > 0) {
      try {
        await encodeSilence(muxer, opts.shift);
      } catch (e) {
        console.warn("Sunyi cover gagal di-encode — dilewati:", e);
      }
    }
    const srcStart2 = srcTimeOf2(clip, clip.start);
    const segLenA = clip.duration * clip.speed / Math.max(1, clip.loopCount);
    const srcEnd2 = clip.inPoint + clamp3(clip.duration * clip.speed, 0, segLenA);
    await copyAudioRange(muxer, file, atr, srcStart2, srcEnd2, opts.shift);
  } else if (support.audioCodec && audioMux) {
    opts.onStage?.("Memproses audio...");
    const cache = opts.audioCache ?? new AudioDecodeCache(new OfflineAudioContext(1, 1, 48000));
    await encodeAudioRange(muxer, support.audioCodec, { start: 0, end: totalDur, rs, bitrate: opts.bitrate }, cache, rs);
  }
  opts.onStage?.("Merender video (mesin Turbo)...");
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx)
    throw new Error("Kanvas offscreen gagal");
  const work = {
    videoFrames: new Map,
    tmpA: document.createElement("canvas"),
    tmpB: document.createElement("canvas"),
    scratch: document.createElement("canvas")
  };
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error("Turbo VideoEncoder:", e)
  });
  encoder.configure({
    codec: support.videoCodec,
    width: w,
    height: h,
    bitrate: opts.bitrate,
    framerate: fps,
    ...support.videoMuxCodec === "avc" ? { avc: { format: "avc" } } : {}
  });
  const segLen = clip.duration * clip.speed / Math.max(1, clip.loopCount);
  const tEnd = Math.min(clip.start + clip.duration, opts.shift + contentDur + 0.02);
  const srcStart = srcTimeOf2(clip, Math.max(clip.start, opts.shift));
  const srcEnd = clip.inPoint + clamp3(Math.max(0, tEnd - clip.start) * clip.speed, 0, segLen);
  const gen = decodeVideoRange(file, vtr, srcStart, srcEnd);
  const buf = [];
  let streamDone = false;
  let pullErr = null;
  const pull = async () => {
    if (streamDone)
      return false;
    let r;
    try {
      r = await gen.next();
    } catch (e) {
      pullErr = e;
      streamDone = true;
      return false;
    }
    if (r.done) {
      streamDone = true;
      return false;
    }
    buf.push(r.value);
    return true;
  };
  const fillBuf = async (n) => {
    while (!streamDone && buf.length < n) {
      const got = await pull();
      if (!got)
        break;
    }
  };
  await fillBuf(4);
  let lastProgress = 0;
  const emit = (p) => {
    const now = performance.now();
    if (p >= 1 || now - lastProgress >= 250) {
      lastProgress = now;
      opts.onProgress?.(p);
    }
  };
  try {
    for (let f = 0;f < totalFrames; f++) {
      if (pullErr)
        throw pullErr;
      const t = f / fps;
      let frame = null;
      if (t >= clip.start - 0.0001 && t < clip.start + clip.duration) {
        const srcT = srcTimeOf2(clip, t);
        while (buf.length >= 2 && buf[1].pts <= srcT + 0.002) {
          buf.shift().frame.close();
        }
        while (buf.length < 2 && !streamDone) {
          const got = await pull();
          if (!got)
            break;
          while (buf.length >= 2 && buf[1].pts <= srcT + 0.002)
            buf.shift().frame.close();
        }
        const head = buf[0];
        if (head && head.pts <= srcT + 0.05)
          frame = head.frame;
        if (buf.length < 6 && !streamDone)
          pull();
      }
      work.videoFrames.set(clip.assetId ?? clip.id, frame);
      engine.composeFrame(ctx, t, true, rs, work);
      work.videoFrames.set(clip.assetId ?? clip.id, null);
      const out = new VideoFrame(canvas, {
        timestamp: Math.round(t * 1e6),
        duration: Math.round(1e6 / fps)
      });
      encoder.encode(out, { keyFrame: f % gopSize === 0 });
      out.close();
      while (encoder.encodeQueueSize > 6)
        await sleep3(2);
      if (buf.length < 4 && !streamDone)
        await pull();
      emit((f + 1) / totalFrames);
    }
  } finally {
    await gen.return(undefined).catch(() => {
      return;
    });
    for (const b of buf)
      b.frame.close();
    buf.length = 0;
  }
  opts.onStage?.("Menyelesaikan berkas...");
  await encoder.flush();
  encoder.close();
  muxer.finalize();
  let savedPath;
  if (writer) {
    try {
      await diskFlush?.flush();
      savedPath = await writer.finish();
    } catch (e) {
      await writer.abort();
      throw e;
    }
  }
  const blob = savedPath ? new Blob : new Blob([targetRef.buffer], { type: "video/mp4" });
  return { blob, ext: ".mp4", mime: "video/mp4", duration: totalDur, savedPath, size: savedPath ? writer?.bytes ?? 0 : blob.size };
}

// scripts/turbo-e2e/test-entry.ts
async function main() {
  const res = { ok: false, steps: [] };
  const steps = res.steps;
  const t0 = performance.now();
  try {
    const resp = await fetch("file:///tmp/turbotest/test_tail.mp4");
    const blob = await resp.blob();
    const file = new File([blob], "test_tail.mp4", { type: "video/mp4" });
    const url2 = URL.createObjectURL(blob);
    const asset = { id: "as-test", name: "test_tail.mp4", type: "video", url: url2, duration: 20, width: 640, height: 360, file };
    const chk = await turboEligible(asset);
    steps.push({ step: "turboEligible", ...chk });
    if (!chk.ok)
      throw new Error("tidak eligible: " + chk.reason);
    const cc = document.createElement("canvas");
    cc.width = 640;
    cc.height = 360;
    const cx = cc.getContext("2d");
    const g = cx.createLinearGradient(0, 0, 640, 360);
    g.addColorStop(0, "#0f172a");
    g.addColorStop(1, "#0e7490");
    cx.fillStyle = g;
    cx.fillRect(0, 0, 640, 360);
    cx.fillStyle = "#fff";
    cx.font = "900 44px sans-serif";
    cx.textAlign = "center";
    cx.fillText("NOVACUT TURBO TEST", 320, 190);
    const cover = { id: "as-cover", name: "cover", type: "image", url: cc.toDataURL("image/png"), duration: 0, width: 640, height: 360 };
    const shift = 3;
    const segs = [
      [0, 10],
      [10, 20]
    ];
    for (let si = 0;si < segs.length; si++) {
      const [r0, r1] = segs[si];
      const vTrack = { id: "tv", kind: "video", name: "V", muted: false, hidden: false };
      const tTrack = { id: "tt", kind: "text", name: "T", muted: false, hidden: false };
      const videoClip = { id: "cl-v", trackId: "tv", kind: "video", assetId: asset.id, start: shift, duration: r1 - r0, inPoint: r0, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0, effects: [], zoom: 1, panX: 0, panY: 0 };
      const coverClip = { id: "cl-c", trackId: "tv", kind: "image", assetId: cover.id, start: 0, duration: shift, inPoint: 0, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0.3, effects: ["fx-kenburns"], zoom: 1, panX: 0, panY: 0, label: "Cover" };
      const titleClip = { id: "cl-t", trackId: "tt", kind: "text", start: 0.15, duration: shift - 0.25, inPoint: 0, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0, effects: [], zoom: 1, panX: 0, panY: 0, text: { content: "Judul Uji Turbo", sub: "Bagian " + (si + 1), size: 0.06, subSize: 0.03, color: "#ffffff", font: "condensed", anim: "slam", pos: "center", bg: "gradient", stroke: true } };
      const partClip = { id: "cl-p", trackId: "tt", kind: "text", start: shift + 0.4, duration: r1 - r0 - 0.4, inPoint: 0, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0, effects: [], zoom: 1, panX: 0, panY: 0, text: { content: "Part " + (si + 1), size: 0.05, color: "#ffffff", font: "condensed", anim: "slam", pos: "bottom", bg: "bar", stroke: true } };
      const rs = { clips: [coverClip, videoClip, titleClip, partClip], tracks: [vTrack, tTrack], assets: [asset, cover], project: { width: 640, height: 360 } };
      const copy = audioCopyAllowed(rs, videoClip, asset);
      const t1 = performance.now();
      let lastP = 0;
      const out = await exportSegmentTurbo({
        rs,
        clip: videoClip,
        asset,
        start: r0,
        end: r1,
        shift,
        bitrate: 9000000,
        directSave: { dir: "/tmp/turbotest/out", name: `turbo-seg${si + 1}` },
        audioCopy: copy,
        onProgress: (p) => {
          if (p - lastP >= 0.5) {
            lastP = p;
            console.log(`seg${si + 1} progress ${p.toFixed(2)}`);
          }
        }
      });
      steps.push({ step: `seg${si + 1}`, ms: Math.round(performance.now() - t1), savedPath: out.savedPath, size: out.size, audioCopy: copy });
    }
    res.ok = true;
    res.ms = Math.round(performance.now() - t0);
  } catch (e) {
    res.error = String(e?.stack || e);
  }
  console.log("TURBO_RESULT " + JSON.stringify(res));
}
main();
