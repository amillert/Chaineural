/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { id } from '../../utils/id';
import { forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { Subject } from 'rxjs';
/**
 * @record
 */
export function D3ForceDirectedSettings() { }
if (false) {
    /** @type {?|undefined} */
    D3ForceDirectedSettings.prototype.force;
    /** @type {?|undefined} */
    D3ForceDirectedSettings.prototype.forceLink;
}
/**
 * @record
 */
export function D3Node() { }
if (false) {
    /** @type {?|undefined} */
    D3Node.prototype.id;
    /** @type {?} */
    D3Node.prototype.x;
    /** @type {?} */
    D3Node.prototype.y;
    /** @type {?|undefined} */
    D3Node.prototype.width;
    /** @type {?|undefined} */
    D3Node.prototype.height;
    /** @type {?|undefined} */
    D3Node.prototype.fx;
    /** @type {?|undefined} */
    D3Node.prototype.fy;
}
/**
 * @record
 */
export function D3Edge() { }
if (false) {
    /** @type {?} */
    D3Edge.prototype.source;
    /** @type {?} */
    D3Edge.prototype.target;
    /** @type {?} */
    D3Edge.prototype.midPoint;
}
/**
 * @record
 */
export function D3Graph() { }
if (false) {
    /** @type {?} */
    D3Graph.prototype.nodes;
    /** @type {?} */
    D3Graph.prototype.edges;
}
/**
 * @record
 */
export function MergedNode() { }
if (false) {
    /** @type {?} */
    MergedNode.prototype.id;
}
/**
 * @param {?} maybeNode
 * @return {?}
 */
export function toD3Node(maybeNode) {
    if (typeof maybeNode === 'string') {
        return {
            id: maybeNode,
            x: 0,
            y: 0
        };
    }
    return maybeNode;
}
var D3ForceDirectedLayout = /** @class */ (function () {
    function D3ForceDirectedLayout() {
        this.defaultSettings = {
            force: forceSimulation()
                .force('charge', forceManyBody().strength(-150))
                .force('collide', forceCollide(5)),
            forceLink: forceLink()
                .id((/**
             * @param {?} node
             * @return {?}
             */
            function (node) { return node.id; }))
                .distance((/**
             * @return {?}
             */
            function () { return 100; }))
        };
        this.settings = {};
        this.outputGraph$ = new Subject();
    }
    /**
     * @param {?} graph
     * @return {?}
     */
    D3ForceDirectedLayout.prototype.run = /**
     * @param {?} graph
     * @return {?}
     */
    function (graph) {
        var _this = this;
        this.inputGraph = graph;
        this.d3Graph = {
            nodes: (/** @type {?} */ (tslib_1.__spread(this.inputGraph.nodes.map((/**
             * @param {?} n
             * @return {?}
             */
            function (n) { return (tslib_1.__assign({}, n)); }))))),
            edges: (/** @type {?} */ (tslib_1.__spread(this.inputGraph.edges.map((/**
             * @param {?} e
             * @return {?}
             */
            function (e) { return (tslib_1.__assign({}, e)); })))))
        };
        this.outputGraph = {
            nodes: [],
            edges: [],
            edgeLabels: []
        };
        this.outputGraph$.next(this.outputGraph);
        this.settings = Object.assign({}, this.defaultSettings, this.settings);
        if (this.settings.force) {
            this.settings.force
                .nodes(this.d3Graph.nodes)
                .force('link', this.settings.forceLink.links(this.d3Graph.edges))
                .alpha(0.5)
                .restart()
                .on('tick', (/**
             * @return {?}
             */
            function () {
                _this.outputGraph$.next(_this.d3GraphToOutputGraph(_this.d3Graph));
            }));
        }
        return this.outputGraph$.asObservable();
    };
    /**
     * @param {?} graph
     * @param {?} edge
     * @return {?}
     */
    D3ForceDirectedLayout.prototype.updateEdge = /**
     * @param {?} graph
     * @param {?} edge
     * @return {?}
     */
    function (graph, edge) {
        var _this = this;
        /** @type {?} */
        var settings = Object.assign({}, this.defaultSettings, this.settings);
        if (settings.force) {
            settings.force
                .nodes(this.d3Graph.nodes)
                .force('link', settings.forceLink.links(this.d3Graph.edges))
                .alpha(0.5)
                .restart()
                .on('tick', (/**
             * @return {?}
             */
            function () {
                _this.outputGraph$.next(_this.d3GraphToOutputGraph(_this.d3Graph));
            }));
        }
        return this.outputGraph$.asObservable();
    };
    /**
     * @param {?} d3Graph
     * @return {?}
     */
    D3ForceDirectedLayout.prototype.d3GraphToOutputGraph = /**
     * @param {?} d3Graph
     * @return {?}
     */
    function (d3Graph) {
        this.outputGraph.nodes = this.d3Graph.nodes.map((/**
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
        this.outputGraph.edges = this.d3Graph.edges.map((/**
         * @param {?} edge
         * @return {?}
         */
        function (edge) { return (tslib_1.__assign({}, edge, { source: toD3Node(edge.source).id, target: toD3Node(edge.target).id, points: [
                {
                    x: toD3Node(edge.source).x,
                    y: toD3Node(edge.source).y
                },
                {
                    x: toD3Node(edge.target).x,
                    y: toD3Node(edge.target).y
                }
            ] })); }));
        this.outputGraph.edgeLabels = this.outputGraph.edges;
        return this.outputGraph;
    };
    /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    D3ForceDirectedLayout.prototype.onDragStart = /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    function (draggingNode, $event) {
        this.settings.force.alphaTarget(0.3).restart();
        /** @type {?} */
        var node = this.d3Graph.nodes.find((/**
         * @param {?} d3Node
         * @return {?}
         */
        function (d3Node) { return d3Node.id === draggingNode.id; }));
        if (!node) {
            return;
        }
        this.draggingStart = { x: $event.x - node.x, y: $event.y - node.y };
        node.fx = $event.x - this.draggingStart.x;
        node.fy = $event.y - this.draggingStart.y;
    };
    /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    D3ForceDirectedLayout.prototype.onDrag = /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    function (draggingNode, $event) {
        if (!draggingNode) {
            return;
        }
        /** @type {?} */
        var node = this.d3Graph.nodes.find((/**
         * @param {?} d3Node
         * @return {?}
         */
        function (d3Node) { return d3Node.id === draggingNode.id; }));
        if (!node) {
            return;
        }
        node.fx = $event.x - this.draggingStart.x;
        node.fy = $event.y - this.draggingStart.y;
    };
    /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    D3ForceDirectedLayout.prototype.onDragEnd = /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    function (draggingNode, $event) {
        if (!draggingNode) {
            return;
        }
        /** @type {?} */
        var node = this.d3Graph.nodes.find((/**
         * @param {?} d3Node
         * @return {?}
         */
        function (d3Node) { return d3Node.id === draggingNode.id; }));
        if (!node) {
            return;
        }
        this.settings.force.alphaTarget(0);
        node.fx = undefined;
        node.fy = undefined;
    };
    return D3ForceDirectedLayout;
}());
export { D3ForceDirectedLayout };
if (false) {
    /** @type {?} */
    D3ForceDirectedLayout.prototype.defaultSettings;
    /** @type {?} */
    D3ForceDirectedLayout.prototype.settings;
    /** @type {?} */
    D3ForceDirectedLayout.prototype.inputGraph;
    /** @type {?} */
    D3ForceDirectedLayout.prototype.outputGraph;
    /** @type {?} */
    D3ForceDirectedLayout.prototype.d3Graph;
    /** @type {?} */
    D3ForceDirectedLayout.prototype.outputGraph$;
    /** @type {?} */
    D3ForceDirectedLayout.prototype.draggingStart;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZDNGb3JjZURpcmVjdGVkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHN3aW1sYW5lL25neC1ncmFwaC8iLCJzb3VyY2VzIjpbImxpYi9ncmFwaC9sYXlvdXRzL2QzRm9yY2VEaXJlY3RlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUdBLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRW5GLE9BQU8sRUFBYyxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7Ozs7QUFHM0MsNkNBR0M7OztJQUZDLHdDQUFZOztJQUNaLDRDQUFnQjs7Ozs7QUFFbEIsNEJBUUM7OztJQVBDLG9CQUFZOztJQUNaLG1CQUFVOztJQUNWLG1CQUFVOztJQUNWLHVCQUFlOztJQUNmLHdCQUFnQjs7SUFDaEIsb0JBQVk7O0lBQ1osb0JBQVk7Ozs7O0FBRWQsNEJBSUM7OztJQUhDLHdCQUF3Qjs7SUFDeEIsd0JBQXdCOztJQUN4QiwwQkFBdUI7Ozs7O0FBRXpCLDZCQUdDOzs7SUFGQyx3QkFBZ0I7O0lBQ2hCLHdCQUFnQjs7Ozs7QUFFbEIsZ0NBRUM7OztJQURDLHdCQUFXOzs7Ozs7QUFHYixNQUFNLFVBQVUsUUFBUSxDQUFDLFNBQTBCO0lBQ2pELElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFO1FBQ2pDLE9BQU87WUFDTCxFQUFFLEVBQUUsU0FBUztZQUNiLENBQUMsRUFBRSxDQUFDO1lBQ0osQ0FBQyxFQUFFLENBQUM7U0FDTCxDQUFDO0tBQ0g7SUFDRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBRUQ7SUFBQTtRQUNFLG9CQUFlLEdBQTRCO1lBQ3pDLEtBQUssRUFBRSxlQUFlLEVBQU87aUJBQzFCLEtBQUssQ0FBQyxRQUFRLEVBQUUsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENB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LE9BQUEsTUFBTSxDQUFDLEVBQUUsS0FBSyxZQUFZLENBQUMsRUFBRSxFQUE3QixDQUE2QixFQUFDO1FBQzdFLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFDcEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUM7SUFDdEIsQ0FBQztJQUNILDRCQUFDO0FBQUQsQ0FBQyxBQXJJRCxJQXFJQzs7OztJQXBJQyxnREFPRTs7SUFDRix5Q0FBdUM7O0lBRXZDLDJDQUFrQjs7SUFDbEIsNENBQW1COztJQUNuQix3Q0FBaUI7O0lBQ2pCLDZDQUE2Qzs7SUFFN0MsOENBQXdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTGF5b3V0IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2xheW91dC5tb2RlbCc7XG5pbXBvcnQgeyBHcmFwaCB9IGZyb20gJy4uLy4uL21vZGVscy9ncmFwaC5tb2RlbCc7XG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL25vZGUubW9kZWwnO1xuaW1wb3J0IHsgaWQgfSBmcm9tICcuLi8uLi91dGlscy9pZCc7XG5pbXBvcnQgeyBmb3JjZUNvbGxpZGUsIGZvcmNlTGluaywgZm9yY2VNYW55Qm9keSwgZm9yY2VTaW11bGF0aW9uIH0gZnJvbSAnZDMtZm9yY2UnO1xuaW1wb3J0IHsgRWRnZSB9IGZyb20gJy4uLy4uL21vZGVscy9lZGdlLm1vZGVsJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IE5vZGVQb3NpdGlvbiB9IGZyb20gJy4uLy4uL21vZGVscyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRDNGb3JjZURpcmVjdGVkU2V0dGluZ3Mge1xuICBmb3JjZT86IGFueTtcbiAgZm9yY2VMaW5rPzogYW55O1xufVxuZXhwb3J0IGludGVyZmFjZSBEM05vZGUge1xuICBpZD86IHN0cmluZztcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIHdpZHRoPzogbnVtYmVyO1xuICBoZWlnaHQ/OiBudW1iZXI7XG4gIGZ4PzogbnVtYmVyO1xuICBmeT86IG51bWJlcjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRDNFZGdlIHtcbiAgc291cmNlOiBzdHJpbmcgfCBEM05vZGU7XG4gIHRhcmdldDogc3RyaW5nIHwgRDNOb2RlO1xuICBtaWRQb2ludDogTm9kZVBvc2l0aW9uO1xufVxuZXhwb3J0IGludGVyZmFjZSBEM0dyYXBoIHtcbiAgbm9kZXM6IEQzTm9kZVtdO1xuICBlZGdlczogRDNFZGdlW107XG59XG5leHBvcnQgaW50ZXJmYWNlIE1lcmdlZE5vZGUgZXh0ZW5kcyBEM05vZGUsIE5vZGUge1xuICBpZDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9EM05vZGUobWF5YmVOb2RlOiBzdHJpbmcgfCBEM05vZGUpOiBEM05vZGUge1xuICBpZiAodHlwZW9mIG1heWJlTm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IG1heWJlTm9kZSxcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwXG4gICAgfTtcbiAgfVxuICByZXR1cm4gbWF5YmVOb2RlO1xufVxuXG5leHBvcnQgY2xhc3MgRDNGb3JjZURpcmVjdGVkTGF5b3V0IGltcGxlbWVudHMgTGF5b3V0IHtcbiAgZGVmYXVsdFNldHRpbmdzOiBEM0ZvcmNlRGlyZWN0ZWRTZXR0aW5ncyA9IHtcbiAgICBmb3JjZTogZm9yY2VTaW11bGF0aW9uPGFueT4oKVxuICAgICAgLmZvcmNlKCdjaGFyZ2UnLCBmb3JjZU1hbnlCb2R5KCkuc3RyZW5ndGgoLTE1MCkpXG4gICAgICAuZm9yY2UoJ2NvbGxpZGUnLCBmb3JjZUNvbGxpZGUoNSkpLFxuICAgIGZvcmNlTGluazogZm9yY2VMaW5rPGFueSwgYW55PigpXG4gICAgICAuaWQobm9kZSA9PiBub2RlLmlkKVxuICAgICAgLmRpc3RhbmNlKCgpID0+IDEwMClcbiAgfTtcbiAgc2V0dGluZ3M6IEQzRm9yY2VEaXJlY3RlZFNldHRpbmdzID0ge307XG5cbiAgaW5wdXRHcmFwaDogR3JhcGg7XG4gIG91dHB1dEdyYXBoOiBHcmFwaDtcbiAgZDNHcmFwaDogRDNHcmFwaDtcbiAgb3V0cHV0R3JhcGgkOiBTdWJqZWN0PEdyYXBoPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgZHJhZ2dpbmdTdGFydDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9O1xuXG4gIHJ1bihncmFwaDogR3JhcGgpOiBPYnNlcnZhYmxlPEdyYXBoPiB7XG4gICAgdGhpcy5pbnB1dEdyYXBoID0gZ3JhcGg7XG4gICAgdGhpcy5kM0dyYXBoID0ge1xuICAgICAgbm9kZXM6IFsuLi50aGlzLmlucHV0R3JhcGgubm9kZXMubWFwKG4gPT4gKHsgLi4ubiB9KSldIGFzIGFueSxcbiAgICAgIGVkZ2VzOiBbLi4udGhpcy5pbnB1dEdyYXBoLmVkZ2VzLm1hcChlID0+ICh7IC4uLmUgfSkpXSBhcyBhbnlcbiAgICB9O1xuICAgIHRoaXMub3V0cHV0R3JhcGggPSB7XG4gICAgICBub2RlczogW10sXG4gICAgICBlZGdlczogW10sXG4gICAgICBlZGdlTGFiZWxzOiBbXVxuICAgIH07XG4gICAgdGhpcy5vdXRwdXRHcmFwaCQubmV4dCh0aGlzLm91dHB1dEdyYXBoKTtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0U2V0dGluZ3MsIHRoaXMuc2V0dGluZ3MpO1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmZvcmNlKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLmZvcmNlXG4gICAgICAgIC5ub2Rlcyh0aGlzLmQzR3JhcGgubm9kZXMpXG4gICAgICAgIC5mb3JjZSgnbGluaycsIHRoaXMuc2V0dGluZ3MuZm9yY2VMaW5rLmxpbmtzKHRoaXMuZDNHcmFwaC5lZGdlcykpXG4gICAgICAgIC5hbHBoYSgwLjUpXG4gICAgICAgIC5yZXN0YXJ0KClcbiAgICAgICAgLm9uKCd0aWNrJywgKCkgPT4ge1xuICAgICAgICAgIHRoaXMub3V0cHV0R3JhcGgkLm5leHQodGhpcy5kM0dyYXBoVG9PdXRwdXRHcmFwaCh0aGlzLmQzR3JhcGgpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMub3V0cHV0R3JhcGgkLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgdXBkYXRlRWRnZShncmFwaDogR3JhcGgsIGVkZ2U6IEVkZ2UpOiBPYnNlcnZhYmxlPEdyYXBoPiB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmF1bHRTZXR0aW5ncywgdGhpcy5zZXR0aW5ncyk7XG4gICAgaWYgKHNldHRpbmdzLmZvcmNlKSB7XG4gICAgICBzZXR0aW5ncy5mb3JjZVxuICAgICAgICAubm9kZXModGhpcy5kM0dyYXBoLm5vZGVzKVxuICAgICAgICAuZm9yY2UoJ2xpbmsnLCBzZXR0aW5ncy5mb3JjZUxpbmsubGlua3ModGhpcy5kM0dyYXBoLmVkZ2VzKSlcbiAgICAgICAgLmFscGhhKDAuNSlcbiAgICAgICAgLnJlc3RhcnQoKVxuICAgICAgICAub24oJ3RpY2snLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5vdXRwdXRHcmFwaCQubmV4dCh0aGlzLmQzR3JhcGhUb091dHB1dEdyYXBoKHRoaXMuZDNHcmFwaCkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5vdXRwdXRHcmFwaCQuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBkM0dyYXBoVG9PdXRwdXRHcmFwaChkM0dyYXBoOiBEM0dyYXBoKTogR3JhcGgge1xuICAgIHRoaXMub3V0cHV0R3JhcGgubm9kZXMgPSB0aGlzLmQzR3JhcGgubm9kZXMubWFwKChub2RlOiBNZXJnZWROb2RlKSA9PiAoe1xuICAgICAgLi4ubm9kZSxcbiAgICAgIGlkOiBub2RlLmlkIHx8IGlkKCksXG4gICAgICBwb3NpdGlvbjoge1xuICAgICAgICB4OiBub2RlLngsXG4gICAgICAgIHk6IG5vZGUueVxuICAgICAgfSxcbiAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICB3aWR0aDogKG5vZGUuZGltZW5zaW9uICYmIG5vZGUuZGltZW5zaW9uLndpZHRoKSB8fCAyMCxcbiAgICAgICAgaGVpZ2h0OiAobm9kZS5kaW1lbnNpb24gJiYgbm9kZS5kaW1lbnNpb24uaGVpZ2h0KSB8fCAyMFxuICAgICAgfSxcbiAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke25vZGUueCAtICgobm9kZS5kaW1lbnNpb24gJiYgbm9kZS5kaW1lbnNpb24ud2lkdGgpIHx8IDIwKSAvIDIgfHwgMH0sICR7bm9kZS55IC1cbiAgICAgICAgKChub2RlLmRpbWVuc2lvbiAmJiBub2RlLmRpbWVuc2lvbi5oZWlnaHQpIHx8IDIwKSAvIDIgfHwgMH0pYFxuICAgIH0pKTtcblxuICAgIHRoaXMub3V0cHV0R3JhcGguZWRnZXMgPSB0aGlzLmQzR3JhcGguZWRnZXMubWFwKGVkZ2UgPT4gKHtcbiAgICAgIC4uLmVkZ2UsXG4gICAgICBzb3VyY2U6IHRvRDNOb2RlKGVkZ2Uuc291cmNlKS5pZCxcbiAgICAgIHRhcmdldDogdG9EM05vZGUoZWRnZS50YXJnZXQpLmlkLFxuICAgICAgcG9pbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB4OiB0b0QzTm9kZShlZGdlLnNvdXJjZSkueCxcbiAgICAgICAgICB5OiB0b0QzTm9kZShlZGdlLnNvdXJjZSkueVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgeDogdG9EM05vZGUoZWRnZS50YXJnZXQpLngsXG4gICAgICAgICAgeTogdG9EM05vZGUoZWRnZS50YXJnZXQpLnlcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pKTtcblxuICAgIHRoaXMub3V0cHV0R3JhcGguZWRnZUxhYmVscyA9IHRoaXMub3V0cHV0R3JhcGguZWRnZXM7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0R3JhcGg7XG4gIH1cblxuICBvbkRyYWdTdGFydChkcmFnZ2luZ05vZGU6IE5vZGUsICRldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuc2V0dGluZ3MuZm9yY2UuYWxwaGFUYXJnZXQoMC4zKS5yZXN0YXJ0KCk7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuZDNHcmFwaC5ub2Rlcy5maW5kKGQzTm9kZSA9PiBkM05vZGUuaWQgPT09IGRyYWdnaW5nTm9kZS5pZCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZHJhZ2dpbmdTdGFydCA9IHsgeDogJGV2ZW50LnggLSBub2RlLngsIHk6ICRldmVudC55IC0gbm9kZS55IH07XG4gICAgbm9kZS5meCA9ICRldmVudC54IC0gdGhpcy5kcmFnZ2luZ1N0YXJ0Lng7XG4gICAgbm9kZS5meSA9ICRldmVudC55IC0gdGhpcy5kcmFnZ2luZ1N0YXJ0Lnk7XG4gIH1cblxuICBvbkRyYWcoZHJhZ2dpbmdOb2RlOiBOb2RlLCAkZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoIWRyYWdnaW5nTm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBub2RlID0gdGhpcy5kM0dyYXBoLm5vZGVzLmZpbmQoZDNOb2RlID0+IGQzTm9kZS5pZCA9PT0gZHJhZ2dpbmdOb2RlLmlkKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbm9kZS5meCA9ICRldmVudC54IC0gdGhpcy5kcmFnZ2luZ1N0YXJ0Lng7XG4gICAgbm9kZS5meSA9ICRldmVudC55IC0gdGhpcy5kcmFnZ2luZ1N0YXJ0Lnk7XG4gIH1cblxuICBvbkRyYWdFbmQoZHJhZ2dpbmdOb2RlOiBOb2RlLCAkZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoIWRyYWdnaW5nTm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBub2RlID0gdGhpcy5kM0dyYXBoLm5vZGVzLmZpbmQoZDNOb2RlID0+IGQzTm9kZS5pZCA9PT0gZHJhZ2dpbmdOb2RlLmlkKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNldHRpbmdzLmZvcmNlLmFscGhhVGFyZ2V0KDApO1xuICAgIG5vZGUuZnggPSB1bmRlZmluZWQ7XG4gICAgbm9kZS5meSA9IHVuZGVmaW5lZDtcbiAgfVxufVxuIl19