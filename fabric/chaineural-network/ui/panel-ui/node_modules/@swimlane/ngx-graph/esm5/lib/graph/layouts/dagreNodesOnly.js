/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { id } from '../../utils/id';
import * as dagre from 'dagre';
/** @enum {string} */
var Orientation = {
    LEFT_TO_RIGHT: 'LR',
    RIGHT_TO_LEFT: 'RL',
    TOP_TO_BOTTOM: 'TB',
    BOTTOM_TO_TOM: 'BT',
};
export { Orientation };
/** @enum {string} */
var Alignment = {
    CENTER: 'C',
    UP_LEFT: 'UL',
    UP_RIGHT: 'UR',
    DOWN_LEFT: 'DL',
    DOWN_RIGHT: 'DR',
};
export { Alignment };
/**
 * @record
 */
export function DagreSettings() { }
if (false) {
    /** @type {?|undefined} */
    DagreSettings.prototype.orientation;
    /** @type {?|undefined} */
    DagreSettings.prototype.marginX;
    /** @type {?|undefined} */
    DagreSettings.prototype.marginY;
    /** @type {?|undefined} */
    DagreSettings.prototype.edgePadding;
    /** @type {?|undefined} */
    DagreSettings.prototype.rankPadding;
    /** @type {?|undefined} */
    DagreSettings.prototype.nodePadding;
    /** @type {?|undefined} */
    DagreSettings.prototype.align;
    /** @type {?|undefined} */
    DagreSettings.prototype.acyclicer;
    /** @type {?|undefined} */
    DagreSettings.prototype.ranker;
    /** @type {?|undefined} */
    DagreSettings.prototype.multigraph;
    /** @type {?|undefined} */
    DagreSettings.prototype.compound;
}
/**
 * @record
 */
export function DagreNodesOnlySettings() { }
if (false) {
    /** @type {?|undefined} */
    DagreNodesOnlySettings.prototype.curveDistance;
}
/** @type {?} */
var DEFAULT_EDGE_NAME = '\x00';
/** @type {?} */
var GRAPH_NODE = '\x00';
/** @type {?} */
var EDGE_KEY_DELIM = '\x01';
var DagreNodesOnlyLayout = /** @class */ (function () {
    function DagreNodesOnlyLayout() {
        this.defaultSettings = {
            orientation: Orientation.LEFT_TO_RIGHT,
            marginX: 20,
            marginY: 20,
            edgePadding: 100,
            rankPadding: 100,
            nodePadding: 50,
            curveDistance: 20,
            multigraph: true,
            compound: true
        };
        this.settings = {};
    }
    /**
     * @param {?} graph
     * @return {?}
     */
    DagreNodesOnlyLayout.prototype.run = /**
     * @param {?} graph
     * @return {?}
     */
    function (graph) {
        var e_1, _a;
        this.createDagreGraph(graph);
        dagre.layout(this.dagreGraph);
        graph.edgeLabels = this.dagreGraph._edgeLabels;
        var _loop_1 = function (dagreNodeId) {
            /** @type {?} */
            var dagreNode = this_1.dagreGraph._nodes[dagreNodeId];
            /** @type {?} */
            var node = graph.nodes.find((/**
             * @param {?} n
             * @return {?}
             */
            function (n) { return n.id === dagreNode.id; }));
            node.position = {
                x: dagreNode.x,
                y: dagreNode.y
            };
            node.dimension = {
                width: dagreNode.width,
                height: dagreNode.height
            };
        };
        var this_1 = this;
        for (var dagreNodeId in this.dagreGraph._nodes) {
            _loop_1(dagreNodeId);
        }
        try {
            for (var _b = tslib_1.__values(graph.edges), _c = _b.next(); !_c.done; _c = _b.next()) {
                var edge = _c.value;
                this.updateEdge(graph, edge);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return graph;
    };
    /**
     * @param {?} graph
     * @param {?} edge
     * @return {?}
     */
    DagreNodesOnlyLayout.prototype.updateEdge = /**
     * @param {?} graph
     * @param {?} edge
     * @return {?}
     */
    function (graph, edge) {
        var _a, _b, _c, _d;
        /** @type {?} */
        var sourceNode = graph.nodes.find((/**
         * @param {?} n
         * @return {?}
         */
        function (n) { return n.id === edge.source; }));
        /** @type {?} */
        var targetNode = graph.nodes.find((/**
         * @param {?} n
         * @return {?}
         */
        function (n) { return n.id === edge.target; }));
        /** @type {?} */
        var rankAxis = this.settings.orientation === 'BT' || this.settings.orientation === 'TB' ? 'y' : 'x';
        /** @type {?} */
        var orderAxis = rankAxis === 'y' ? 'x' : 'y';
        /** @type {?} */
        var rankDimension = rankAxis === 'y' ? 'height' : 'width';
        // determine new arrow position
        /** @type {?} */
        var dir = sourceNode.position[rankAxis] <= targetNode.position[rankAxis] ? -1 : 1;
        /** @type {?} */
        var startingPoint = (_a = {},
            _a[orderAxis] = sourceNode.position[orderAxis],
            _a[rankAxis] = sourceNode.position[rankAxis] - dir * (sourceNode.dimension[rankDimension] / 2),
            _a);
        /** @type {?} */
        var endingPoint = (_b = {},
            _b[orderAxis] = targetNode.position[orderAxis],
            _b[rankAxis] = targetNode.position[rankAxis] + dir * (targetNode.dimension[rankDimension] / 2),
            _b);
        /** @type {?} */
        var curveDistance = this.settings.curveDistance || this.defaultSettings.curveDistance;
        // generate new points
        edge.points = [
            startingPoint,
            (_c = {},
                _c[orderAxis] = startingPoint[orderAxis],
                _c[rankAxis] = startingPoint[rankAxis] - dir * curveDistance,
                _c),
            (_d = {},
                _d[orderAxis] = endingPoint[orderAxis],
                _d[rankAxis] = endingPoint[rankAxis] + dir * curveDistance,
                _d),
            endingPoint
        ];
        /** @type {?} */
        var edgeLabelId = "" + edge.source + EDGE_KEY_DELIM + edge.target + EDGE_KEY_DELIM + DEFAULT_EDGE_NAME;
        /** @type {?} */
        var matchingEdgeLabel = graph.edgeLabels[edgeLabelId];
        if (matchingEdgeLabel) {
            matchingEdgeLabel.points = edge.points;
        }
        return graph;
    };
    /**
     * @param {?} graph
     * @return {?}
     */
    DagreNodesOnlyLayout.prototype.createDagreGraph = /**
     * @param {?} graph
     * @return {?}
     */
    function (graph) {
        var e_2, _a, e_3, _b;
        /** @type {?} */
        var settings = Object.assign({}, this.defaultSettings, this.settings);
        this.dagreGraph = new dagre.graphlib.Graph({ compound: settings.compound, multigraph: settings.multigraph });
        this.dagreGraph.setGraph({
            rankdir: settings.orientation,
            marginx: settings.marginX,
            marginy: settings.marginY,
            edgesep: settings.edgePadding,
            ranksep: settings.rankPadding,
            nodesep: settings.nodePadding,
            align: settings.align,
            acyclicer: settings.acyclicer,
            ranker: settings.ranker,
            multigraph: settings.multigraph,
            compound: settings.compound
        });
        // Default to assigning a new object as a label for each new edge.
        this.dagreGraph.setDefaultEdgeLabel((/**
         * @return {?}
         */
        function () {
            return {
            /* empty */
            };
        }));
        this.dagreNodes = graph.nodes.map((/**
         * @param {?} n
         * @return {?}
         */
        function (n) {
            /** @type {?} */
            var node = Object.assign({}, n);
            node.width = n.dimension.width;
            node.height = n.dimension.height;
            node.x = n.position.x;
            node.y = n.position.y;
            return node;
        }));
        this.dagreEdges = graph.edges.map((/**
         * @param {?} l
         * @return {?}
         */
        function (l) {
            /** @type {?} */
            var newLink = Object.assign({}, l);
            if (!newLink.id) {
                newLink.id = id();
            }
            return newLink;
        }));
        try {
            for (var _c = tslib_1.__values(this.dagreNodes), _d = _c.next(); !_d.done; _d = _c.next()) {
                var node = _d.value;
                if (!node.width) {
                    node.width = 20;
                }
                if (!node.height) {
                    node.height = 30;
                }
                // update dagre
                this.dagreGraph.setNode(node.id, node);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        try {
            // update dagre
            for (var _e = tslib_1.__values(this.dagreEdges), _f = _e.next(); !_f.done; _f = _e.next()) {
                var edge = _f.value;
                if (settings.multigraph) {
                    this.dagreGraph.setEdge(edge.source, edge.target, edge, edge.id);
                }
                else {
                    this.dagreGraph.setEdge(edge.source, edge.target);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return this.dagreGraph;
    };
    return DagreNodesOnlyLayout;
}());
export { DagreNodesOnlyLayout };
if (false) {
    /** @type {?} */
    DagreNodesOnlyLayout.prototype.defaultSettings;
    /** @type {?} */
    DagreNodesOnlyLayout.prototype.settings;
    /** @type {?} */
    DagreNodesOnlyLayout.prototype.dagreGraph;
    /** @type {?} */
    DagreNodesOnlyLayout.prototype.dagreNodes;
    /** @type {?} */
    DagreNodesOnlyLayout.prototype.dagreEdges;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFncmVOb2Rlc09ubHkuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ac3dpbWxhbmUvbmd4LWdyYXBoLyIsInNvdXJjZXMiOlsibGliL2dyYXBoL2xheW91dHMvZGFncmVOb2Rlc09ubHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEMsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7OztJQUk3QixlQUFnQixJQUFJO0lBQ3BCLGVBQWdCLElBQUk7SUFDcEIsZUFBZ0IsSUFBSTtJQUNwQixlQUFnQixJQUFJOzs7OztJQUdwQixRQUFTLEdBQUc7SUFDWixTQUFVLElBQUk7SUFDZCxVQUFXLElBQUk7SUFDZixXQUFZLElBQUk7SUFDaEIsWUFBYSxJQUFJOzs7Ozs7QUFHbkIsbUNBWUM7OztJQVhDLG9DQUEwQjs7SUFDMUIsZ0NBQWlCOztJQUNqQixnQ0FBaUI7O0lBQ2pCLG9DQUFxQjs7SUFDckIsb0NBQXFCOztJQUNyQixvQ0FBcUI7O0lBQ3JCLDhCQUFrQjs7SUFDbEIsa0NBQWlDOztJQUNqQywrQkFBMkQ7O0lBQzNELG1DQUFxQjs7SUFDckIsaUNBQW1COzs7OztBQUdyQiw0Q0FFQzs7O0lBREMsK0NBQXVCOzs7SUFHbkIsaUJBQWlCLEdBQUcsTUFBTTs7SUFDMUIsVUFBVSxHQUFHLE1BQU07O0lBQ25CLGNBQWMsR0FBRyxNQUFNO0FBRTdCO0lBQUE7UUFDRSxvQkFBZSxHQUEyQjtZQUN4QyxXQUFXLEVBQUUsV0FBVyxDQUFDLGFBQWE7WUFDdEMsT0FBTyxFQUFFLEVBQUU7WUFDWCxPQUFPLEVBQUUsRUFBRTtZQUNYLFdBQVcsRUFBRSxHQUFHO1lBQ2hCLFdBQVcsRUFBRSxHQUFHO1lBQ2hCLFdBQVcsRUFBRSxFQUFFO1lBQ2YsYUFBYSxFQUFFLEVBQUU7WUFDakIsVUFBVSxFQUFFLElBQUk7WUFDaEIsUUFBUSxFQUFFLElBQUk7U0FDZixDQUFDO1FBQ0YsYUFB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LFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ25EO2FBQ0Y7Ozs7Ozs7OztRQUVELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN6QixDQUFDO0lBQ0gsMkJBQUM7QUFBRCxDQUFDLEFBbEpELElBa0pDOzs7O0lBakpDLCtDQVVFOztJQUNGLHdDQUFzQzs7SUFFdEMsMENBQWdCOztJQUNoQiwwQ0FBZ0I7O0lBQ2hCLDBDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExheW91dCB9IGZyb20gJy4uLy4uL21vZGVscy9sYXlvdXQubW9kZWwnO1xuaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuLi8uLi9tb2RlbHMvZ3JhcGgubW9kZWwnO1xuaW1wb3J0IHsgaWQgfSBmcm9tICcuLi8uLi91dGlscy9pZCc7XG5pbXBvcnQgKiBhcyBkYWdyZSBmcm9tICdkYWdyZSc7XG5pbXBvcnQgeyBFZGdlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VkZ2UubW9kZWwnO1xuXG5leHBvcnQgZW51bSBPcmllbnRhdGlvbiB7XG4gIExFRlRfVE9fUklHSFQgPSAnTFInLFxuICBSSUdIVF9UT19MRUZUID0gJ1JMJyxcbiAgVE9QX1RPX0JPVFRPTSA9ICdUQicsXG4gIEJPVFRPTV9UT19UT00gPSAnQlQnXG59XG5leHBvcnQgZW51bSBBbGlnbm1lbnQge1xuICBDRU5URVIgPSAnQycsXG4gIFVQX0xFRlQgPSAnVUwnLFxuICBVUF9SSUdIVCA9ICdVUicsXG4gIERPV05fTEVGVCA9ICdETCcsXG4gIERPV05fUklHSFQgPSAnRFInXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGFncmVTZXR0aW5ncyB7XG4gIG9yaWVudGF0aW9uPzogT3JpZW50YXRpb247XG4gIG1hcmdpblg/OiBudW1iZXI7XG4gIG1hcmdpblk/OiBudW1iZXI7XG4gIGVkZ2VQYWRkaW5nPzogbnVtYmVyO1xuICByYW5rUGFkZGluZz86IG51bWJlcjtcbiAgbm9kZVBhZGRpbmc/OiBudW1iZXI7XG4gIGFsaWduPzogQWxpZ25tZW50O1xuICBhY3ljbGljZXI/OiAnZ3JlZWR5JyB8IHVuZGVmaW5lZDtcbiAgcmFua2VyPzogJ25ldHdvcmstc2ltcGxleCcgfCAndGlnaHQtdHJlZScgfCAnbG9uZ2VzdC1wYXRoJztcbiAgbXVsdGlncmFwaD86IGJvb2xlYW47XG4gIGNvbXBvdW5kPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEYWdyZU5vZGVzT25seVNldHRpbmdzIGV4dGVuZHMgRGFncmVTZXR0aW5ncyB7XG4gIGN1cnZlRGlzdGFuY2U/OiBudW1iZXI7XG59XG5cbmNvbnN0IERFRkFVTFRfRURHRV9OQU1FID0gJ1xceDAwJztcbmNvbnN0IEdSQVBIX05PREUgPSAnXFx4MDAnO1xuY29uc3QgRURHRV9LRVlfREVMSU0gPSAnXFx4MDEnO1xuXG5leHBvcnQgY2xhc3MgRGFncmVOb2Rlc09ubHlMYXlvdXQgaW1wbGVtZW50cyBMYXlvdXQge1xuICBkZWZhdWx0U2V0dGluZ3M6IERhZ3JlTm9kZXNPbmx5U2V0dGluZ3MgPSB7XG4gICAgb3JpZW50YXRpb246IE9yaWVudGF0aW9uLkxFRlRfVE9fUklHSFQsXG4gICAgbWFyZ2luWDogMjAsXG4gICAgbWFyZ2luWTogMjAsXG4gICAgZWRnZVBhZGRpbmc6IDEwMCxcbiAgICByYW5rUGFkZGluZzogMTAwLFxuICAgIG5vZGVQYWRkaW5nOiA1MCxcbiAgICBjdXJ2ZURpc3RhbmNlOiAyMCxcbiAgICBtdWx0aWdyYXBoOiB0cnVlLFxuICAgIGNvbXBvdW5kOiB0cnVlXG4gIH07XG4gIHNldHRpbmdzOiBEYWdyZU5vZGVzT25seVNldHRpbmdzID0ge307XG5cbiAgZGFncmVHcmFwaDogYW55O1xuICBkYWdyZU5vZGVzOiBhbnk7XG4gIGRhZ3JlRWRnZXM6IGFueTtcblxuICBydW4oZ3JhcGg6IEdyYXBoKTogR3JhcGgge1xuICAgIHRoaXMuY3JlYXRlRGFncmVHcmFwaChncmFwaCk7XG4gICAgZGFncmUubGF5b3V0KHRoaXMuZGFncmVHcmFwaCk7XG5cbiAgICBncmFwaC5lZGdlTGFiZWxzID0gdGhpcy5kYWdyZUdyYXBoLl9lZGdlTGFiZWxzO1xuXG4gICAgZm9yIChjb25zdCBkYWdyZU5vZGVJZCBpbiB0aGlzLmRhZ3JlR3JhcGguX25vZGVzKSB7XG4gICAgICBjb25zdCBkYWdyZU5vZGUgPSB0aGlzLmRhZ3JlR3JhcGguX25vZGVzW2RhZ3JlTm9kZUlkXTtcbiAgICAgIGNvbnN0IG5vZGUgPSBncmFwaC5ub2Rlcy5maW5kKG4gPT4gbi5pZCA9PT0gZGFncmVOb2RlLmlkKTtcbiAgICAgIG5vZGUucG9zaXRpb24gPSB7XG4gICAgICAgIHg6IGRhZ3JlTm9kZS54LFxuICAgICAgICB5OiBkYWdyZU5vZGUueVxuICAgICAgfTtcbiAgICAgIG5vZGUuZGltZW5zaW9uID0ge1xuICAgICAgICB3aWR0aDogZGFncmVOb2RlLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IGRhZ3JlTm9kZS5oZWlnaHRcbiAgICAgIH07XG4gICAgfVxuICAgIGZvciAoY29uc3QgZWRnZSBvZiBncmFwaC5lZGdlcykge1xuICAgICAgdGhpcy51cGRhdGVFZGdlKGdyYXBoLCBlZGdlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ3JhcGg7XG4gIH1cblxuICB1cGRhdGVFZGdlKGdyYXBoOiBHcmFwaCwgZWRnZTogRWRnZSk6IEdyYXBoIHtcbiAgICBjb25zdCBzb3VyY2VOb2RlID0gZ3JhcGgubm9kZXMuZmluZChuID0+IG4uaWQgPT09IGVkZ2Uuc291cmNlKTtcbiAgICBjb25zdCB0YXJnZXROb2RlID0gZ3JhcGgubm9kZXMuZmluZChuID0+IG4uaWQgPT09IGVkZ2UudGFyZ2V0KTtcbiAgICBjb25zdCByYW5rQXhpczogJ3gnIHwgJ3knID0gdGhpcy5zZXR0aW5ncy5vcmllbnRhdGlvbiA9PT0gJ0JUJyB8fCB0aGlzLnNldHRpbmdzLm9yaWVudGF0aW9uID09PSAnVEInID8gJ3knIDogJ3gnO1xuICAgIGNvbnN0IG9yZGVyQXhpczogJ3gnIHwgJ3knID0gcmFua0F4aXMgPT09ICd5JyA/ICd4JyA6ICd5JztcbiAgICBjb25zdCByYW5rRGltZW5zaW9uID0gcmFua0F4aXMgPT09ICd5JyA/ICdoZWlnaHQnIDogJ3dpZHRoJztcbiAgICAvLyBkZXRlcm1pbmUgbmV3IGFycm93IHBvc2l0aW9uXG4gICAgY29uc3QgZGlyID0gc291cmNlTm9kZS5wb3NpdGlvbltyYW5rQXhpc10gPD0gdGFyZ2V0Tm9kZS5wb3NpdGlvbltyYW5rQXhpc10gPyAtMSA6IDE7XG4gICAgY29uc3Qgc3RhcnRpbmdQb2ludCA9IHtcbiAgICAgIFtvcmRlckF4aXNdOiBzb3VyY2VOb2RlLnBvc2l0aW9uW29yZGVyQXhpc10sXG4gICAgICBbcmFua0F4aXNdOiBzb3VyY2VOb2RlLnBvc2l0aW9uW3JhbmtBeGlzXSAtIGRpciAqIChzb3VyY2VOb2RlLmRpbWVuc2lvbltyYW5rRGltZW5zaW9uXSAvIDIpXG4gICAgfTtcbiAgICBjb25zdCBlbmRpbmdQb2ludCA9IHtcbiAgICAgIFtvcmRlckF4aXNdOiB0YXJnZXROb2RlLnBvc2l0aW9uW29yZGVyQXhpc10sXG4gICAgICBbcmFua0F4aXNdOiB0YXJnZXROb2RlLnBvc2l0aW9uW3JhbmtBeGlzXSArIGRpciAqICh0YXJnZXROb2RlLmRpbWVuc2lvbltyYW5rRGltZW5zaW9uXSAvIDIpXG4gICAgfTtcblxuICAgIGNvbnN0IGN1cnZlRGlzdGFuY2UgPSB0aGlzLnNldHRpbmdzLmN1cnZlRGlzdGFuY2UgfHwgdGhpcy5kZWZhdWx0U2V0dGluZ3MuY3VydmVEaXN0YW5jZTtcbiAgICAvLyBnZW5lcmF0ZSBuZXcgcG9pbnRzXG4gICAgZWRnZS5wb2ludHMgPSBbXG4gICAgICBzdGFydGluZ1BvaW50LFxuICAgICAge1xuICAgICAgICBbb3JkZXJBeGlzXTogc3RhcnRpbmdQb2ludFtvcmRlckF4aXNdLFxuICAgICAgICBbcmFua0F4aXNdOiBzdGFydGluZ1BvaW50W3JhbmtBeGlzXSAtIGRpciAqIGN1cnZlRGlzdGFuY2VcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFtvcmRlckF4aXNdOiBlbmRpbmdQb2ludFtvcmRlckF4aXNdLFxuICAgICAgICBbcmFua0F4aXNdOiBlbmRpbmdQb2ludFtyYW5rQXhpc10gKyBkaXIgKiBjdXJ2ZURpc3RhbmNlXG4gICAgICB9LFxuICAgICAgZW5kaW5nUG9pbnRcbiAgICBdO1xuICAgIGNvbnN0IGVkZ2VMYWJlbElkID0gYCR7ZWRnZS5zb3VyY2V9JHtFREdFX0tFWV9ERUxJTX0ke2VkZ2UudGFyZ2V0fSR7RURHRV9LRVlfREVMSU19JHtERUZBVUxUX0VER0VfTkFNRX1gO1xuICAgIGNvbnN0IG1hdGNoaW5nRWRnZUxhYmVsID0gZ3JhcGguZWRnZUxhYmVsc1tlZGdlTGFiZWxJZF07XG4gICAgaWYgKG1hdGNoaW5nRWRnZUxhYmVsKSB7XG4gICAgICBtYXRjaGluZ0VkZ2VMYWJlbC5wb2ludHMgPSBlZGdlLnBvaW50cztcbiAgICB9XG4gICAgcmV0dXJuIGdyYXBoO1xuICB9XG5cbiAgY3JlYXRlRGFncmVHcmFwaChncmFwaDogR3JhcGgpOiBhbnkge1xuICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0U2V0dGluZ3MsIHRoaXMuc2V0dGluZ3MpO1xuICAgIHRoaXMuZGFncmVHcmFwaCA9IG5ldyBkYWdyZS5ncmFwaGxpYi5HcmFwaCh7IGNvbXBvdW5kOiBzZXR0aW5ncy5jb21wb3VuZCwgbXVsdGlncmFwaDogc2V0dGluZ3MubXVsdGlncmFwaCB9KTtcbiAgICB0aGlzLmRhZ3JlR3JhcGguc2V0R3JhcGgoe1xuICAgICAgcmFua2Rpcjogc2V0dGluZ3Mub3JpZW50YXRpb24sXG4gICAgICBtYXJnaW54OiBzZXR0aW5ncy5tYXJnaW5YLFxuICAgICAgbWFyZ2lueTogc2V0dGluZ3MubWFyZ2luWSxcbiAgICAgIGVkZ2VzZXA6IHNldHRpbmdzLmVkZ2VQYWRkaW5nLFxuICAgICAgcmFua3NlcDogc2V0dGluZ3MucmFua1BhZGRpbmcsXG4gICAgICBub2Rlc2VwOiBzZXR0aW5ncy5ub2RlUGFkZGluZyxcbiAgICAgIGFsaWduOiBzZXR0aW5ncy5hbGlnbixcbiAgICAgIGFjeWNsaWNlcjogc2V0dGluZ3MuYWN5Y2xpY2VyLFxuICAgICAgcmFua2VyOiBzZXR0aW5ncy5yYW5rZXIsXG4gICAgICBtdWx0aWdyYXBoOiBzZXR0aW5ncy5tdWx0aWdyYXBoLFxuICAgICAgY29tcG91bmQ6IHNldHRpbmdzLmNvbXBvdW5kXG4gICAgfSk7XG5cbiAgICAvLyBEZWZhdWx0IHRvIGFzc2lnbmluZyBhIG5ldyBvYmplY3QgYXMgYSBsYWJlbCBmb3IgZWFjaCBuZXcgZWRnZS5cbiAgICB0aGlzLmRhZ3JlR3JhcGguc2V0RGVmYXVsdEVkZ2VMYWJlbCgoKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAvKiBlbXB0eSAqL1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHRoaXMuZGFncmVOb2RlcyA9IGdyYXBoLm5vZGVzLm1hcChuID0+IHtcbiAgICAgIGNvbnN0IG5vZGU6IGFueSA9IE9iamVjdC5hc3NpZ24oe30sIG4pO1xuICAgICAgbm9kZS53aWR0aCA9IG4uZGltZW5zaW9uLndpZHRoO1xuICAgICAgbm9kZS5oZWlnaHQgPSBuLmRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICBub2RlLnggPSBuLnBvc2l0aW9uLng7XG4gICAgICBub2RlLnkgPSBuLnBvc2l0aW9uLnk7XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9KTtcblxuICAgIHRoaXMuZGFncmVFZGdlcyA9IGdyYXBoLmVkZ2VzLm1hcChsID0+IHtcbiAgICAgIGNvbnN0IG5ld0xpbms6IGFueSA9IE9iamVjdC5hc3NpZ24oe30sIGwpO1xuICAgICAgaWYgKCFuZXdMaW5rLmlkKSB7XG4gICAgICAgIG5ld0xpbmsuaWQgPSBpZCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld0xpbms7XG4gICAgfSk7XG5cbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgdGhpcy5kYWdyZU5vZGVzKSB7XG4gICAgICBpZiAoIW5vZGUud2lkdGgpIHtcbiAgICAgICAgbm9kZS53aWR0aCA9IDIwO1xuICAgICAgfVxuICAgICAgaWYgKCFub2RlLmhlaWdodCkge1xuICAgICAgICBub2RlLmhlaWdodCA9IDMwO1xuICAgICAgfVxuXG4gICAgICAvLyB1cGRhdGUgZGFncmVcbiAgICAgIHRoaXMuZGFncmVHcmFwaC5zZXROb2RlKG5vZGUuaWQsIG5vZGUpO1xuICAgIH1cblxuICAgIC8vIHVwZGF0ZSBkYWdyZVxuICAgIGZvciAoY29uc3QgZWRnZSBvZiB0aGlzLmRhZ3JlRWRnZXMpIHtcbiAgICAgIGlmIChzZXR0aW5ncy5tdWx0aWdyYXBoKSB7XG4gICAgICAgIHRoaXMuZGFncmVHcmFwaC5zZXRFZGdlKGVkZ2Uuc291cmNlLCBlZGdlLnRhcmdldCwgZWRnZSwgZWRnZS5pZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRhZ3JlR3JhcGguc2V0RWRnZShlZGdlLnNvdXJjZSwgZWRnZS50YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmRhZ3JlR3JhcGg7XG4gIH1cbn1cbiJdfQ==