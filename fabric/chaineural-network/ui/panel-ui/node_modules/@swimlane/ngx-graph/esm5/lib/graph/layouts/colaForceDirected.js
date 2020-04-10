/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { id } from '../../utils/id';
import { d3adaptor } from 'webcola';
import * as d3Dispatch from 'd3-dispatch';
import * as d3Force from 'd3-force';
import * as d3Timer from 'd3-timer';
import { Subject } from 'rxjs';
/**
 * @record
 */
export function ColaForceDirectedSettings() { }
if (false) {
    /** @type {?|undefined} */
    ColaForceDirectedSettings.prototype.force;
    /** @type {?|undefined} */
    ColaForceDirectedSettings.prototype.forceModifierFn;
    /** @type {?|undefined} */
    ColaForceDirectedSettings.prototype.onTickListener;
    /** @type {?|undefined} */
    ColaForceDirectedSettings.prototype.viewDimensions;
}
/**
 * @record
 */
export function ColaGraph() { }
if (false) {
    /** @type {?} */
    ColaGraph.prototype.groups;
    /** @type {?} */
    ColaGraph.prototype.nodes;
    /** @type {?} */
    ColaGraph.prototype.links;
}
/**
 * @param {?} nodes
 * @param {?} nodeRef
 * @return {?}
 */
export function toNode(nodes, nodeRef) {
    if (typeof nodeRef === 'number') {
        return nodes[nodeRef];
    }
    return nodeRef;
}
var ColaForceDirectedLayout = /** @class */ (function () {
    function ColaForceDirectedLayout() {
        this.defaultSettings = {
            force: d3adaptor(tslib_1.__assign({}, d3Dispatch, d3Force, d3Timer))
                .linkDistance(150)
                .avoidOverlaps(true),
            viewDimensions: {
                width: 600,
                height: 600,
                xOffset: 0
            }
        };
        this.settings = {};
        this.outputGraph$ = new Subject();
    }
    /**
     * @param {?} graph
     * @return {?}
     */
    ColaForceDirectedLayout.prototype.run = /**
     * @param {?} graph
     * @return {?}
     */
    function (graph) {
        var _this = this;
        this.inputGraph = graph;
        if (!this.inputGraph.clusters) {
            this.inputGraph.clusters = [];
        }
        this.internalGraph = {
            nodes: (/** @type {?} */ (tslib_1.__spread(this.inputGraph.nodes.map((/**
             * @param {?} n
             * @return {?}
             */
            function (n) { return (tslib_1.__assign({}, n, { width: n.dimension ? n.dimension.width : 20, height: n.dimension ? n.dimension.height : 20 })); }))))),
            groups: tslib_1.__spread(this.inputGraph.clusters.map((/**
             * @param {?} cluster
             * @return {?}
             */
            function (cluster) { return ({
                padding: 5,
                groups: cluster.childNodeIds
                    .map((/**
                 * @param {?} nodeId
                 * @return {?}
                 */
                function (nodeId) { return (/** @type {?} */ (_this.inputGraph.clusters.findIndex((/**
                 * @param {?} node
                 * @return {?}
                 */
                function (node) { return node.id === nodeId; })))); }))
                    .filter((/**
                 * @param {?} x
                 * @return {?}
                 */
                function (x) { return x >= 0; })),
                leaves: cluster.childNodeIds
                    .map((/**
                 * @param {?} nodeId
                 * @return {?}
                 */
                function (nodeId) { return (/** @type {?} */ (_this.inputGraph.nodes.findIndex((/**
                 * @param {?} node
                 * @return {?}
                 */
                function (node) { return node.id === nodeId; })))); }))
                    .filter((/**
                 * @param {?} x
                 * @return {?}
                 */
                function (x) { return x >= 0; }))
            }); }))),
            links: (/** @type {?} */ (tslib_1.__spread(this.inputGraph.edges
                .map((/**
             * @param {?} e
             * @return {?}
             */
            function (e) {
                /** @type {?} */
                var sourceNodeIndex = _this.inputGraph.nodes.findIndex((/**
                 * @param {?} node
                 * @return {?}
                 */
                function (node) { return e.source === node.id; }));
                /** @type {?} */
                var targetNodeIndex = _this.inputGraph.nodes.findIndex((/**
                 * @param {?} node
                 * @return {?}
                 */
                function (node) { return e.target === node.id; }));
                if (sourceNodeIndex === -1 || targetNodeIndex === -1) {
                    return undefined;
                }
                return tslib_1.__assign({}, e, { source: sourceNodeIndex, target: targetNodeIndex });
            }))
                .filter((/**
             * @param {?} x
             * @return {?}
             */
            function (x) { return !!x; }))))),
            groupLinks: tslib_1.__spread(this.inputGraph.edges
                .map((/**
             * @param {?} e
             * @return {?}
             */
            function (e) {
                /** @type {?} */
                var sourceNodeIndex = _this.inputGraph.nodes.findIndex((/**
                 * @param {?} node
                 * @return {?}
                 */
                function (node) { return e.source === node.id; }));
                /** @type {?} */
                var targetNodeIndex = _this.inputGraph.nodes.findIndex((/**
                 * @param {?} node
                 * @return {?}
                 */
                function (node) { return e.target === node.id; }));
                if (sourceNodeIndex >= 0 && targetNodeIndex >= 0) {
                    return undefined;
                }
                return e;
            }))
                .filter((/**
             * @param {?} x
             * @return {?}
             */
            function (x) { return !!x; })))
        };
        this.outputGraph = {
            nodes: [],
            clusters: [],
            edges: [],
            edgeLabels: []
        };
        this.outputGraph$.next(this.outputGraph);
        this.settings = Object.assign({}, this.defaultSettings, this.settings);
        if (this.settings.force) {
            this.settings.force = this.settings.force
                .nodes(this.internalGraph.nodes)
                .groups(this.internalGraph.groups)
                .links(this.internalGraph.links)
                .alpha(0.5)
                .on('tick', (/**
             * @return {?}
             */
            function () {
                if (_this.settings.onTickListener) {
                    _this.settings.onTickListener(_this.internalGraph);
                }
                _this.outputGraph$.next(_this.internalGraphToOutputGraph(_this.internalGraph));
            }));
            if (this.settings.viewDimensions) {
                this.settings.force = this.settings.force.size([
                    this.settings.viewDimensions.width,
                    this.settings.viewDimensions.height
                ]);
            }
            if (this.settings.forceModifierFn) {
                this.settings.force = this.settings.forceModifierFn(this.settings.force);
            }
            this.settings.force.start();
        }
        return this.outputGraph$.asObservable();
    };
    /**
     * @param {?} graph
     * @param {?} edge
     * @return {?}
     */
    ColaForceDirectedLayout.prototype.updateEdge = /**
     * @param {?} graph
     * @param {?} edge
     * @return {?}
     */
    function (graph, edge) {
        /** @type {?} */
        var settings = Object.assign({}, this.defaultSettings, this.settings);
        if (settings.force) {
            settings.force.start();
        }
        return this.outputGraph$.asObservable();
    };
    /**
     * @param {?} internalGraph
     * @return {?}
     */
    ColaForceDirectedLayout.prototype.internalGraphToOutputGraph = /**
     * @param {?} internalGraph
     * @return {?}
     */
    function (internalGraph) {
        var _this = this;
        this.outputGraph.nodes = internalGraph.nodes.map((/**
         * @param {?} node
         * @return {?}
         */
        function (node) { return (tslib_1.__assign({}, node, { id: node.id || id(), position: {
                x: node.x,
                y: node.y
            }, dimension: {
                width: (node.dimension && node.dimension.width) || 20,
                height: (node.dimension && node.dimension.height) || 20
            }, transform: "translate(" + (node.x - ((node.dimension && node.dimension.width) || 20) / 2 || 0) + ", " + (node.y -
                ((node.dimension && node.dimension.height) || 20) / 2 || 0) + ")" })); }));
        this.outputGraph.edges = internalGraph.links
            .map((/**
         * @param {?} edge
         * @return {?}
         */
        function (edge) {
            /** @type {?} */
            var source = toNode(internalGraph.nodes, edge.source);
            /** @type {?} */
            var target = toNode(internalGraph.nodes, edge.target);
            return tslib_1.__assign({}, edge, { source: source.id, target: target.id, points: [
                    ((/** @type {?} */ (source.bounds))).rayIntersection(target.bounds.cx(), target.bounds.cy()),
                    ((/** @type {?} */ (target.bounds))).rayIntersection(source.bounds.cx(), source.bounds.cy())
                ] });
        }))
            .concat(internalGraph.groupLinks.map((/**
         * @param {?} groupLink
         * @return {?}
         */
        function (groupLink) {
            /** @type {?} */
            var sourceNode = internalGraph.nodes.find((/**
             * @param {?} foundNode
             * @return {?}
             */
            function (foundNode) { return ((/** @type {?} */ (foundNode))).id === groupLink.source; }));
            /** @type {?} */
            var targetNode = internalGraph.nodes.find((/**
             * @param {?} foundNode
             * @return {?}
             */
            function (foundNode) { return ((/** @type {?} */ (foundNode))).id === groupLink.target; }));
            /** @type {?} */
            var source = sourceNode || internalGraph.groups.find((/**
             * @param {?} foundGroup
             * @return {?}
             */
            function (foundGroup) { return ((/** @type {?} */ (foundGroup))).id === groupLink.source; }));
            /** @type {?} */
            var target = targetNode || internalGraph.groups.find((/**
             * @param {?} foundGroup
             * @return {?}
             */
            function (foundGroup) { return ((/** @type {?} */ (foundGroup))).id === groupLink.target; }));
            return tslib_1.__assign({}, groupLink, { source: source.id, target: target.id, points: [
                    ((/** @type {?} */ (source.bounds))).rayIntersection(target.bounds.cx(), target.bounds.cy()),
                    ((/** @type {?} */ (target.bounds))).rayIntersection(source.bounds.cx(), source.bounds.cy())
                ] });
        })));
        this.outputGraph.clusters = internalGraph.groups.map((/**
         * @param {?} group
         * @param {?} index
         * @return {?}
         */
        function (group, index) {
            /** @type {?} */
            var inputGroup = _this.inputGraph.clusters[index];
            return tslib_1.__assign({}, inputGroup, { dimension: {
                    width: group.bounds ? group.bounds.width() : 20,
                    height: group.bounds ? group.bounds.height() : 20
                }, position: {
                    x: group.bounds ? group.bounds.x + group.bounds.width() / 2 : 0,
                    y: group.bounds ? group.bounds.y + group.bounds.height() / 2 : 0
                } });
        }));
        this.outputGraph.edgeLabels = this.outputGraph.edges;
        return this.outputGraph;
    };
    /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    ColaForceDirectedLayout.prototype.onDragStart = /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    function (draggingNode, $event) {
        /** @type {?} */
        var nodeIndex = this.outputGraph.nodes.findIndex((/**
         * @param {?} foundNode
         * @return {?}
         */
        function (foundNode) { return foundNode.id === draggingNode.id; }));
        /** @type {?} */
        var node = this.internalGraph.nodes[nodeIndex];
        if (!node) {
            return;
        }
        this.draggingStart = { x: node.x - $event.x, y: node.y - $event.y };
        node.fixed = 1;
        this.settings.force.start();
    };
    /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    ColaForceDirectedLayout.prototype.onDrag = /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    function (draggingNode, $event) {
        if (!draggingNode) {
            return;
        }
        /** @type {?} */
        var nodeIndex = this.outputGraph.nodes.findIndex((/**
         * @param {?} foundNode
         * @return {?}
         */
        function (foundNode) { return foundNode.id === draggingNode.id; }));
        /** @type {?} */
        var node = this.internalGraph.nodes[nodeIndex];
        if (!node) {
            return;
        }
        node.x = this.draggingStart.x + $event.x;
        node.y = this.draggingStart.y + $event.y;
    };
    /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    ColaForceDirectedLayout.prototype.onDragEnd = /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    function (draggingNode, $event) {
        if (!draggingNode) {
            return;
        }
        /** @type {?} */
        var nodeIndex = this.outputGraph.nodes.findIndex((/**
         * @param {?} foundNode
         * @return {?}
         */
        function (foundNode) { return foundNode.id === draggingNode.id; }));
        /** @type {?} */
        var node = this.internalGraph.nodes[nodeIndex];
        if (!node) {
            return;
        }
        node.fixed = 0;
    };
    return ColaForceDirectedLayout;
}());
export { ColaForceDirectedLayout };
if (false) {
    /** @type {?} */
    ColaForceDirectedLayout.prototype.defaultSettings;
    /** @type {?} */
    ColaForceDirectedLayout.prototype.settings;
    /** @type {?} */
    ColaForceDirectedLayout.prototype.inputGraph;
    /** @type {?} */
    ColaForceDirectedLayout.prototype.outputGraph;
    /** @type {?} */
    ColaForceDirectedLayout.prototype.internalGraph;
    /** @type {?} */
    ColaForceDirectedLayout.prototype.outputGraph$;
    /** @type {?} */
    ColaForceDirectedLayout.prototype.draggingStart;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sYUZvcmNlRGlyZWN0ZWQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ac3dpbWxhbmUvbmd4LWdyYXBoLyIsInNvdXJjZXMiOlsibGliL2dyYXBoL2xheW91dHMvY29sYUZvcmNlRGlyZWN0ZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFHQSxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEMsT0FBTyxFQUFFLFNBQVMsRUFBa0YsTUFBTSxTQUFTLENBQUM7QUFDcEgsT0FBTyxLQUFLLFVBQVUsTUFBTSxhQUFhLENBQUM7QUFDMUMsT0FBTyxLQUFLLE9BQU8sTUFBTSxVQUFVLENBQUM7QUFDcEMsT0FBTyxLQUFLLE9BQU8sTUFBTSxVQUFVLENBQUM7QUFFcEMsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7OztBQUczQywrQ0FLQzs7O0lBSkMsMENBQTJDOztJQUMzQyxvREFBb0c7O0lBQ3BHLG1EQUFvRDs7SUFDcEQsbURBQWdDOzs7OztBQUVsQywrQkFJQzs7O0lBSEMsMkJBQWdCOztJQUNoQiwwQkFBbUI7O0lBQ25CLDBCQUEyQjs7Ozs7OztBQUU3QixNQUFNLFVBQVUsTUFBTSxDQUFDLEtBQWtCLEVBQUUsT0FBMkI7SUFDcEUsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7UUFDL0IsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdkI7SUFDRCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBRUQ7SUFBQTtRQUNFLG9CQUFlLEdBQThCO1lBQzNDLEtBQUssRUFBRSxTQUFTLHNCQUNYLFVBQVUsRUFDVixPQUFPLEVBQ1AsT0FBTyxFQUNWO2lCQUNDLFlBQVksQ0FBQyxHQUFHLENBQUM7aUJBQ2pCLGFBQWEsQ0FBQyxJQUFJLENBQUM7WUFDdEIsY0FBYyxFQUFFO2dCQUNkLEtBQUssRUFBRSxHQUFHO2dCQUNWLE1BQU0sRUFBRSxHQUFHO2dCQUNYLE9BQU8sRUFBRSxDQUFD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QUMsQ0FBQyxDQUFDO0lBQzNDLENBQUM7Ozs7OztJQUVELDJDQUFTOzs7OztJQUFULFVBQVUsWUFBa0IsRUFBRSxNQUFrQjtRQUM5QyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2pCLE9BQU87U0FDUjs7WUFDSyxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUzs7OztRQUFDLFVBQUEsU0FBUyxJQUFJLE9BQUEsU0FBUyxDQUFDLEVBQUUsS0FBSyxZQUFZLENBQUMsRUFBRSxFQUFoQyxDQUFnQyxFQUFDOztZQUMzRixJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2hELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNqQixDQUFDO0lBQ0gsOEJBQUM7QUFBRCxDQUFDLEFBck9ELElBcU9DOzs7O0lBcE9DLGtEQWFFOztJQUNGLDJDQUF5Qzs7SUFFekMsNkNBQWtCOztJQUNsQiw4Q0FBbUI7O0lBQ25CLGdEQUFtRDs7SUFDbkQsK0NBQTZDOztJQUU3QyxnREFBd0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMYXlvdXQgfSBmcm9tICcuLi8uLi9tb2RlbHMvbGF5b3V0Lm1vZGVsJztcbmltcG9ydCB7IEdyYXBoIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dyYXBoLm1vZGVsJztcbmltcG9ydCB7IE5vZGUsIENsdXN0ZXJOb2RlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL25vZGUubW9kZWwnO1xuaW1wb3J0IHsgaWQgfSBmcm9tICcuLi8uLi91dGlscy9pZCc7XG5pbXBvcnQgeyBkM2FkYXB0b3IsIElEM1N0eWxlTGF5b3V0QWRhcHRvciwgTGF5b3V0IGFzIENvbGFMYXlvdXQsIEdyb3VwLCBJbnB1dE5vZGUsIExpbmssIFJlY3RhbmdsZSB9IGZyb20gJ3dlYmNvbGEnO1xuaW1wb3J0ICogYXMgZDNEaXNwYXRjaCBmcm9tICdkMy1kaXNwYXRjaCc7XG5pbXBvcnQgKiBhcyBkM0ZvcmNlIGZyb20gJ2QzLWZvcmNlJztcbmltcG9ydCAqIGFzIGQzVGltZXIgZnJvbSAnZDMtdGltZXInO1xuaW1wb3J0IHsgRWRnZSB9IGZyb20gJy4uLy4uL21vZGVscy9lZGdlLm1vZGVsJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFZpZXdEaW1lbnNpb25zIH0gZnJvbSAnQHN3aW1sYW5lL25neC1jaGFydHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbGFGb3JjZURpcmVjdGVkU2V0dGluZ3Mge1xuICBmb3JjZT86IENvbGFMYXlvdXQgJiBJRDNTdHlsZUxheW91dEFkYXB0b3I7XG4gIGZvcmNlTW9kaWZpZXJGbj86IChmb3JjZTogQ29sYUxheW91dCAmIElEM1N0eWxlTGF5b3V0QWRhcHRvcikgPT4gQ29sYUxheW91dCAmIElEM1N0eWxlTGF5b3V0QWRhcHRvcjtcbiAgb25UaWNrTGlzdGVuZXI/OiAoaW50ZXJuYWxHcmFwaDogQ29sYUdyYXBoKSA9PiB2b2lkO1xuICB2aWV3RGltZW5zaW9ucz86IFZpZXdEaW1lbnNpb25zO1xufVxuZXhwb3J0IGludGVyZmFjZSBDb2xhR3JhcGgge1xuICBncm91cHM6IEdyb3VwW107XG4gIG5vZGVzOiBJbnB1dE5vZGVbXTtcbiAgbGlua3M6IEFycmF5PExpbms8bnVtYmVyPj47XG59XG5leHBvcnQgZnVuY3Rpb24gdG9Ob2RlKG5vZGVzOiBJbnB1dE5vZGVbXSwgbm9kZVJlZjogSW5wdXROb2RlIHwgbnVtYmVyKTogSW5wdXROb2RlIHtcbiAgaWYgKHR5cGVvZiBub2RlUmVmID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBub2Rlc1tub2RlUmVmXTtcbiAgfVxuICByZXR1cm4gbm9kZVJlZjtcbn1cblxuZXhwb3J0IGNsYXNzIENvbGFGb3JjZURpcmVjdGVkTGF5b3V0IGltcGxlbWVudHMgTGF5b3V0IHtcbiAgZGVmYXVsdFNldHRpbmdzOiBDb2xhRm9yY2VEaXJlY3RlZFNldHRpbmdzID0ge1xuICAgIGZvcmNlOiBkM2FkYXB0b3Ioe1xuICAgICAgLi4uZDNEaXNwYXRjaCxcbiAgICAgIC4uLmQzRm9yY2UsXG4gICAgICAuLi5kM1RpbWVyXG4gICAgfSlcbiAgICAgIC5saW5rRGlzdGFuY2UoMTUwKVxuICAgICAgLmF2b2lkT3ZlcmxhcHModHJ1ZSksXG4gICAgdmlld0RpbWVuc2lvbnM6IHtcbiAgICAgIHdpZHRoOiA2MDAsXG4gICAgICBoZWlnaHQ6IDYwMCxcbiAgICAgIHhPZmZzZXQ6IDBcbiAgICB9XG4gIH07XG4gIHNldHRpbmdzOiBDb2xhRm9yY2VEaXJlY3RlZFNldHRpbmdzID0ge307XG5cbiAgaW5wdXRHcmFwaDogR3JhcGg7XG4gIG91dHB1dEdyYXBoOiBHcmFwaDtcbiAgaW50ZXJuYWxHcmFwaDogQ29sYUdyYXBoICYgeyBncm91cExpbmtzPzogRWRnZVtdIH07XG4gIG91dHB1dEdyYXBoJDogU3ViamVjdDxHcmFwaD4gPSBuZXcgU3ViamVjdCgpO1xuXG4gIGRyYWdnaW5nU3RhcnQ6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfTtcblxuICBydW4oZ3JhcGg6IEdyYXBoKTogT2JzZXJ2YWJsZTxHcmFwaD4ge1xuICAgIHRoaXMuaW5wdXRHcmFwaCA9IGdyYXBoO1xuICAgIGlmICghdGhpcy5pbnB1dEdyYXBoLmNsdXN0ZXJzKSB7XG4gICAgICB0aGlzLmlucHV0R3JhcGguY2x1c3RlcnMgPSBbXTtcbiAgICB9XG4gICAgdGhpcy5pbnRlcm5hbEdyYXBoID0ge1xuICAgICAgbm9kZXM6IFtcbiAgICAgICAgLi4udGhpcy5pbnB1dEdyYXBoLm5vZGVzLm1hcChuID0+ICh7XG4gICAgICAgICAgLi4ubixcbiAgICAgICAgICB3aWR0aDogbi5kaW1lbnNpb24gPyBuLmRpbWVuc2lvbi53aWR0aCA6IDIwLFxuICAgICAgICAgIGhlaWdodDogbi5kaW1lbnNpb24gPyBuLmRpbWVuc2lvbi5oZWlnaHQgOiAyMFxuICAgICAgICB9KSlcbiAgICAgIF0gYXMgYW55LFxuICAgICAgZ3JvdXBzOiBbXG4gICAgICAgIC4uLnRoaXMuaW5wdXRHcmFwaC5jbHVzdGVycy5tYXAoXG4gICAgICAgICAgKGNsdXN0ZXIpOiBHcm91cCA9PiAoe1xuICAgICAgICAgICAgcGFkZGluZzogNSxcbiAgICAgICAgICAgIGdyb3VwczogY2x1c3Rlci5jaGlsZE5vZGVJZHNcbiAgICAgICAgICAgICAgLm1hcChub2RlSWQgPT4gPGFueT50aGlzLmlucHV0R3JhcGguY2x1c3RlcnMuZmluZEluZGV4KG5vZGUgPT4gbm9kZS5pZCA9PT0gbm9kZUlkKSlcbiAgICAgICAgICAgICAgLmZpbHRlcih4ID0+IHggPj0gMCksXG4gICAgICAgICAgICBsZWF2ZXM6IGNsdXN0ZXIuY2hpbGROb2RlSWRzXG4gICAgICAgICAgICAgIC5tYXAobm9kZUlkID0+IDxhbnk+dGhpcy5pbnB1dEdyYXBoLm5vZGVzLmZpbmRJbmRleChub2RlID0+IG5vZGUuaWQgPT09IG5vZGVJZCkpXG4gICAgICAgICAgICAgIC5maWx0ZXIoeCA9PiB4ID49IDApXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgXSxcbiAgICAgIGxpbmtzOiBbXG4gICAgICAgIC4uLnRoaXMuaW5wdXRHcmFwaC5lZGdlc1xuICAgICAgICAgIC5tYXAoZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2VOb2RlSW5kZXggPSB0aGlzLmlucHV0R3JhcGgubm9kZXMuZmluZEluZGV4KG5vZGUgPT4gZS5zb3VyY2UgPT09IG5vZGUuaWQpO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0Tm9kZUluZGV4ID0gdGhpcy5pbnB1dEdyYXBoLm5vZGVzLmZpbmRJbmRleChub2RlID0+IGUudGFyZ2V0ID09PSBub2RlLmlkKTtcbiAgICAgICAgICAgIGlmIChzb3VyY2VOb2RlSW5kZXggPT09IC0xIHx8IHRhcmdldE5vZGVJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIC4uLmUsXG4gICAgICAgICAgICAgIHNvdXJjZTogc291cmNlTm9kZUluZGV4LFxuICAgICAgICAgICAgICB0YXJnZXQ6IHRhcmdldE5vZGVJbmRleFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5maWx0ZXIoeCA9PiAhIXgpXG4gICAgICBdIGFzIGFueSxcbiAgICAgIGdyb3VwTGlua3M6IFtcbiAgICAgICAgLi4udGhpcy5pbnB1dEdyYXBoLmVkZ2VzXG4gICAgICAgICAgLm1hcChlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZU5vZGVJbmRleCA9IHRoaXMuaW5wdXRHcmFwaC5ub2Rlcy5maW5kSW5kZXgobm9kZSA9PiBlLnNvdXJjZSA9PT0gbm9kZS5pZCk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXROb2RlSW5kZXggPSB0aGlzLmlucHV0R3JhcGgubm9kZXMuZmluZEluZGV4KG5vZGUgPT4gZS50YXJnZXQgPT09IG5vZGUuaWQpO1xuICAgICAgICAgICAgaWYgKHNvdXJjZU5vZGVJbmRleCA+PSAwICYmIHRhcmdldE5vZGVJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5maWx0ZXIoeCA9PiAhIXgpXG4gICAgICBdXG4gICAgfTtcbiAgICB0aGlzLm91dHB1dEdyYXBoID0ge1xuICAgICAgbm9kZXM6IFtdLFxuICAgICAgY2x1c3RlcnM6IFtdLFxuICAgICAgZWRnZXM6IFtdLFxuICAgICAgZWRnZUxhYmVsczogW11cbiAgICB9O1xuICAgIHRoaXMub3V0cHV0R3JhcGgkLm5leHQodGhpcy5vdXRwdXRHcmFwaCk7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmYXVsdFNldHRpbmdzLCB0aGlzLnNldHRpbmdzKTtcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5mb3JjZSkge1xuICAgICAgdGhpcy5zZXR0aW5ncy5mb3JjZSA9IHRoaXMuc2V0dGluZ3MuZm9yY2VcbiAgICAgICAgLm5vZGVzKHRoaXMuaW50ZXJuYWxHcmFwaC5ub2RlcylcbiAgICAgICAgLmdyb3Vwcyh0aGlzLmludGVybmFsR3JhcGguZ3JvdXBzKVxuICAgICAgICAubGlua3ModGhpcy5pbnRlcm5hbEdyYXBoLmxpbmtzKVxuICAgICAgICAuYWxwaGEoMC41KVxuICAgICAgICAub24oJ3RpY2snLCAoKSA9PiB7XG4gICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3Mub25UaWNrTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3Mub25UaWNrTGlzdGVuZXIodGhpcy5pbnRlcm5hbEdyYXBoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5vdXRwdXRHcmFwaCQubmV4dCh0aGlzLmludGVybmFsR3JhcGhUb091dHB1dEdyYXBoKHRoaXMuaW50ZXJuYWxHcmFwaCkpO1xuICAgICAgICB9KTtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLnZpZXdEaW1lbnNpb25zKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuZm9yY2UgPSB0aGlzLnNldHRpbmdzLmZvcmNlLnNpemUoW1xuICAgICAgICAgIHRoaXMuc2V0dGluZ3Mudmlld0RpbWVuc2lvbnMud2lkdGgsXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy52aWV3RGltZW5zaW9ucy5oZWlnaHRcbiAgICAgICAgXSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy5mb3JjZU1vZGlmaWVyRm4pIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5mb3JjZSA9IHRoaXMuc2V0dGluZ3MuZm9yY2VNb2RpZmllckZuKHRoaXMuc2V0dGluZ3MuZm9yY2UpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXR0aW5ncy5mb3JjZS5zdGFydCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm91dHB1dEdyYXBoJC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIHVwZGF0ZUVkZ2UoZ3JhcGg6IEdyYXBoLCBlZGdlOiBFZGdlKTogT2JzZXJ2YWJsZTxHcmFwaD4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0U2V0dGluZ3MsIHRoaXMuc2V0dGluZ3MpO1xuICAgIGlmIChzZXR0aW5ncy5mb3JjZSkge1xuICAgICAgc2V0dGluZ3MuZm9yY2Uuc3RhcnQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5vdXRwdXRHcmFwaCQuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBpbnRlcm5hbEdyYXBoVG9PdXRwdXRHcmFwaChpbnRlcm5hbEdyYXBoOiBhbnkpOiBHcmFwaCB7XG4gICAgdGhpcy5vdXRwdXRHcmFwaC5ub2RlcyA9IGludGVybmFsR3JhcGgubm9kZXMubWFwKG5vZGUgPT4gKHtcbiAgICAgIC4uLm5vZGUsXG4gICAgICBpZDogbm9kZS5pZCB8fCBpZCgpLFxuICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgeDogbm9kZS54LFxuICAgICAgICB5OiBub2RlLnlcbiAgICAgIH0sXG4gICAgICBkaW1lbnNpb246IHtcbiAgICAgICAgd2lkdGg6IChub2RlLmRpbWVuc2lvbiAmJiBub2RlLmRpbWVuc2lvbi53aWR0aCkgfHwgMjAsXG4gICAgICAgIGhlaWdodDogKG5vZGUuZGltZW5zaW9uICYmIG5vZGUuZGltZW5zaW9uLmhlaWdodCkgfHwgMjBcbiAgICAgIH0sXG4gICAgICB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHtub2RlLnggLSAoKG5vZGUuZGltZW5zaW9uICYmIG5vZGUuZGltZW5zaW9uLndpZHRoKSB8fCAyMCkgLyAyIHx8IDB9LCAke25vZGUueSAtXG4gICAgICAgICgobm9kZS5kaW1lbnNpb24gJiYgbm9kZS5kaW1lbnNpb24uaGVpZ2h0KSB8fCAyMCkgLyAyIHx8IDB9KWBcbiAgICB9KSk7XG5cbiAgICB0aGlzLm91dHB1dEdyYXBoLmVkZ2VzID0gaW50ZXJuYWxHcmFwaC5saW5rc1xuICAgICAgLm1hcChlZGdlID0+IHtcbiAgICAgICAgY29uc3Qgc291cmNlOiBhbnkgPSB0b05vZGUoaW50ZXJuYWxHcmFwaC5ub2RlcywgZWRnZS5zb3VyY2UpO1xuICAgICAgICBjb25zdCB0YXJnZXQ6IGFueSA9IHRvTm9kZShpbnRlcm5hbEdyYXBoLm5vZGVzLCBlZGdlLnRhcmdldCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uZWRnZSxcbiAgICAgICAgICBzb3VyY2U6IHNvdXJjZS5pZCxcbiAgICAgICAgICB0YXJnZXQ6IHRhcmdldC5pZCxcbiAgICAgICAgICBwb2ludHM6IFtcbiAgICAgICAgICAgIChzb3VyY2UuYm91bmRzIGFzIFJlY3RhbmdsZSkucmF5SW50ZXJzZWN0aW9uKHRhcmdldC5ib3VuZHMuY3goKSwgdGFyZ2V0LmJvdW5kcy5jeSgpKSxcbiAgICAgICAgICAgICh0YXJnZXQuYm91bmRzIGFzIFJlY3RhbmdsZSkucmF5SW50ZXJzZWN0aW9uKHNvdXJjZS5ib3VuZHMuY3goKSwgc291cmNlLmJvdW5kcy5jeSgpKVxuICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICAgIH0pXG4gICAgICAuY29uY2F0KFxuICAgICAgICBpbnRlcm5hbEdyYXBoLmdyb3VwTGlua3MubWFwKGdyb3VwTGluayA9PiB7XG4gICAgICAgICAgY29uc3Qgc291cmNlTm9kZSA9IGludGVybmFsR3JhcGgubm9kZXMuZmluZChmb3VuZE5vZGUgPT4gKGZvdW5kTm9kZSBhcyBhbnkpLmlkID09PSBncm91cExpbmsuc291cmNlKTtcbiAgICAgICAgICBjb25zdCB0YXJnZXROb2RlID0gaW50ZXJuYWxHcmFwaC5ub2Rlcy5maW5kKGZvdW5kTm9kZSA9PiAoZm91bmROb2RlIGFzIGFueSkuaWQgPT09IGdyb3VwTGluay50YXJnZXQpO1xuICAgICAgICAgIGNvbnN0IHNvdXJjZSA9XG4gICAgICAgICAgICBzb3VyY2VOb2RlIHx8IGludGVybmFsR3JhcGguZ3JvdXBzLmZpbmQoZm91bmRHcm91cCA9PiAoZm91bmRHcm91cCBhcyBhbnkpLmlkID09PSBncm91cExpbmsuc291cmNlKTtcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPVxuICAgICAgICAgICAgdGFyZ2V0Tm9kZSB8fCBpbnRlcm5hbEdyYXBoLmdyb3Vwcy5maW5kKGZvdW5kR3JvdXAgPT4gKGZvdW5kR3JvdXAgYXMgYW55KS5pZCA9PT0gZ3JvdXBMaW5rLnRhcmdldCk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmdyb3VwTGluayxcbiAgICAgICAgICAgIHNvdXJjZTogc291cmNlLmlkLFxuICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXQuaWQsXG4gICAgICAgICAgICBwb2ludHM6IFtcbiAgICAgICAgICAgICAgKHNvdXJjZS5ib3VuZHMgYXMgUmVjdGFuZ2xlKS5yYXlJbnRlcnNlY3Rpb24odGFyZ2V0LmJvdW5kcy5jeCgpLCB0YXJnZXQuYm91bmRzLmN5KCkpLFxuICAgICAgICAgICAgICAodGFyZ2V0LmJvdW5kcyBhcyBSZWN0YW5nbGUpLnJheUludGVyc2VjdGlvbihzb3VyY2UuYm91bmRzLmN4KCksIHNvdXJjZS5ib3VuZHMuY3koKSlcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIHRoaXMub3V0cHV0R3JhcGguY2x1c3RlcnMgPSBpbnRlcm5hbEdyYXBoLmdyb3Vwcy5tYXAoXG4gICAgICAoZ3JvdXAsIGluZGV4KTogQ2x1c3Rlck5vZGUgPT4ge1xuICAgICAgICBjb25zdCBpbnB1dEdyb3VwID0gdGhpcy5pbnB1dEdyYXBoLmNsdXN0ZXJzW2luZGV4XTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5pbnB1dEdyb3VwLFxuICAgICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgICAgd2lkdGg6IGdyb3VwLmJvdW5kcyA/IGdyb3VwLmJvdW5kcy53aWR0aCgpIDogMjAsXG4gICAgICAgICAgICBoZWlnaHQ6IGdyb3VwLmJvdW5kcyA/IGdyb3VwLmJvdW5kcy5oZWlnaHQoKSA6IDIwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgICAgeDogZ3JvdXAuYm91bmRzID8gZ3JvdXAuYm91bmRzLnggKyBncm91cC5ib3VuZHMud2lkdGgoKSAvIDIgOiAwLFxuICAgICAgICAgICAgeTogZ3JvdXAuYm91bmRzID8gZ3JvdXAuYm91bmRzLnkgKyBncm91cC5ib3VuZHMuaGVpZ2h0KCkgLyAyIDogMFxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMub3V0cHV0R3JhcGguZWRnZUxhYmVscyA9IHRoaXMub3V0cHV0R3JhcGguZWRnZXM7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0R3JhcGg7XG4gIH1cblxuICBvbkRyYWdTdGFydChkcmFnZ2luZ05vZGU6IE5vZGUsICRldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGVJbmRleCA9IHRoaXMub3V0cHV0R3JhcGgubm9kZXMuZmluZEluZGV4KGZvdW5kTm9kZSA9PiBmb3VuZE5vZGUuaWQgPT09IGRyYWdnaW5nTm9kZS5pZCk7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuaW50ZXJuYWxHcmFwaC5ub2Rlc1tub2RlSW5kZXhdO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmRyYWdnaW5nU3RhcnQgPSB7IHg6IG5vZGUueCAtICRldmVudC54LCB5OiBub2RlLnkgLSAkZXZlbnQueSB9O1xuICAgIG5vZGUuZml4ZWQgPSAxO1xuICAgIHRoaXMuc2V0dGluZ3MuZm9yY2Uuc3RhcnQoKTtcbiAgfVxuXG4gIG9uRHJhZyhkcmFnZ2luZ05vZGU6IE5vZGUsICRldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmICghZHJhZ2dpbmdOb2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5vZGVJbmRleCA9IHRoaXMub3V0cHV0R3JhcGgubm9kZXMuZmluZEluZGV4KGZvdW5kTm9kZSA9PiBmb3VuZE5vZGUuaWQgPT09IGRyYWdnaW5nTm9kZS5pZCk7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuaW50ZXJuYWxHcmFwaC5ub2Rlc1tub2RlSW5kZXhdO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub2RlLnggPSB0aGlzLmRyYWdnaW5nU3RhcnQueCArICRldmVudC54O1xuICAgIG5vZGUueSA9IHRoaXMuZHJhZ2dpbmdTdGFydC55ICsgJGV2ZW50Lnk7XG4gIH1cblxuICBvbkRyYWdFbmQoZHJhZ2dpbmdOb2RlOiBOb2RlLCAkZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoIWRyYWdnaW5nTm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBub2RlSW5kZXggPSB0aGlzLm91dHB1dEdyYXBoLm5vZGVzLmZpbmRJbmRleChmb3VuZE5vZGUgPT4gZm91bmROb2RlLmlkID09PSBkcmFnZ2luZ05vZGUuaWQpO1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLmludGVybmFsR3JhcGgubm9kZXNbbm9kZUluZGV4XTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBub2RlLmZpeGVkID0gMDtcbiAgfVxufVxuIl19