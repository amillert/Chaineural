/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
var cache = {};
/**
 * Generates a short id.
 *
 * @return {?}
 */
export function id() {
    /** @type {?} */
    var newId = ('0000' + ((Math.random() * Math.pow(36, 4)) << 0).toString(36)).slice(-4);
    newId = "a" + newId;
    // ensure not already used
    if (!cache[newId]) {
        cache[newId] = true;
        return newId;
    }
    return id();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ac3dpbWxhbmUvbmd4LWdyYXBoLyIsInNvdXJjZXMiOlsibGliL3V0aWxzL2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0lBQU0sS0FBSyxHQUFHLEVBQUU7Ozs7OztBQU1oQixNQUFNLFVBQVUsRUFBRTs7UUFDWixLQUFLLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0RixLQUFLLEdBQUcsTUFBSSxLQUFPLENBQUM7SUFFcEIsMEJBQTBCO0lBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDakIsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNwQixPQUFPLEtBQUssQ0FBQztLQUNkO0lBRUQsT0FBTyxFQUFFLEVBQUUsQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBjYWNoZSA9IHt9O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHNob3J0IGlkLlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlkKCk6IHN0cmluZyB7XG4gIGxldCBuZXdJZCA9ICgnMDAwMCcgKyAoKE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygzNiwgNCkpIDw8IDApLnRvU3RyaW5nKDM2KSkuc2xpY2UoLTQpO1xuXG4gIG5ld0lkID0gYGEke25ld0lkfWA7XG5cbiAgLy8gZW5zdXJlIG5vdCBhbHJlYWR5IHVzZWRcbiAgaWYgKCFjYWNoZVtuZXdJZF0pIHtcbiAgICBjYWNoZVtuZXdJZF0gPSB0cnVlO1xuICAgIHJldHVybiBuZXdJZDtcbiAgfVxuXG4gIHJldHVybiBpZCgpO1xufVxuIl19