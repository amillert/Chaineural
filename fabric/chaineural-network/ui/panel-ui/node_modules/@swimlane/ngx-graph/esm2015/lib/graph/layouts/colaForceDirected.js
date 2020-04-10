/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
export class ColaForceDirectedLayout {
    constructor() {
        this.defaultSettings = {
            force: d3adaptor(Object.assign({}, d3Dispatch, d3Force, d3Timer))
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
    run(graph) {
        this.inputGraph = graph;
        if (!this.inputGraph.clusters) {
            this.inputGraph.clusters = [];
        }
        this.internalGraph = {
            nodes: (/** @type {?} */ ([
                ...this.inputGraph.nodes.map((/**
                 * @param {?} n
                 * @return {?}
                 */
                n => (Object.assign({}, n, { width: n.dimension ? n.dimension.width : 20, height: n.dimension ? n.dimension.height : 20 }))))
            ])),
            groups: [
                ...this.inputGraph.clusters.map((/**
                 * @param {?} cluster
                 * @return {?}
                 */
                (cluster) => ({
                    padding: 5,
                    groups: cluster.childNodeIds
                        .map((/**
                     * @param {?} nodeId
                     * @return {?}
                     */
                    nodeId => (/** @type {?} */ (this.inputGraph.clusters.findIndex((/**
                     * @param {?} node
                     * @return {?}
                     */
                    node => node.id === nodeId))))))
                        .filter((/**
                     * @param {?} x
                     * @return {?}
                     */
                    x => x >= 0)),
                    leaves: cluster.childNodeIds
                        .map((/**
                     * @param {?} nodeId
                     * @return {?}
                     */
                    nodeId => (/** @type {?} */ (this.inputGraph.nodes.findIndex((/**
                     * @param {?} node
                     * @return {?}
                     */
                    node => node.id === nodeId))))))
                        .filter((/**
                     * @param {?} x
                     * @return {?}
                     */
                    x => x >= 0))
                })))
            ],
            links: (/** @type {?} */ ([
                ...this.inputGraph.edges
                    .map((/**
                 * @param {?} e
                 * @return {?}
                 */
                e => {
                    /** @type {?} */
                    const sourceNodeIndex = this.inputGraph.nodes.findIndex((/**
                     * @param {?} node
                     * @return {?}
                     */
                    node => e.source === node.id));
                    /** @type {?} */
                    const targetNodeIndex = this.inputGraph.nodes.findIndex((/**
                     * @param {?} node
                     * @return {?}
                     */
                    node => e.target === node.id));
                    if (sourceNodeIndex === -1 || targetNodeIndex === -1) {
                        return undefined;
                    }
                    return Object.assign({}, e, { source: sourceNodeIndex, target: targetNodeIndex });
                }))
                    .filter((/**
                 * @param {?} x
                 * @return {?}
                 */
                x => !!x))
            ])),
            groupLinks: [
                ...this.inputGraph.edges
                    .map((/**
                 * @param {?} e
                 * @return {?}
                 */
                e => {
                    /** @type {?} */
                    const sourceNodeIndex = this.inputGraph.nodes.findIndex((/**
                     * @param {?} node
                     * @return {?}
                     */
                    node => e.source === node.id));
                    /** @type {?} */
                    const targetNodeIndex = this.inputGraph.nodes.findIndex((/**
                     * @param {?} node
                     * @return {?}
                     */
                    node => e.target === node.id));
                    if (sourceNodeIndex >= 0 && targetNodeIndex >= 0) {
                        return undefined;
                    }
                    return e;
                }))
                    .filter((/**
                 * @param {?} x
                 * @return {?}
                 */
                x => !!x))
            ]
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
            () => {
                if (this.settings.onTickListener) {
                    this.settings.onTickListener(this.internalGraph);
                }
                this.outputGraph$.next(this.internalGraphToOutputGraph(this.internalGraph));
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
    }
    /**
     * @param {?} graph
     * @param {?} edge
     * @return {?}
     */
    updateEdge(graph, edge) {
        /** @type {?} */
        const settings = Object.assign({}, this.defaultSettings, this.settings);
        if (settings.force) {
            settings.force.start();
        }
        return this.outputGraph$.asObservable();
    }
    /**
     * @param {?} internalGraph
     * @return {?}
     */
    internalGraphToOutputGraph(internalGraph) {
        this.outputGraph.nodes = internalGraph.nodes.map((/**
         * @param {?} node
         * @return {?}
         */
        node => (Object.assign({}, node, { id: node.id || id(), position: {
                x: node.x,
                y: node.y
            }, dimension: {
                width: (node.dimension && node.dimension.width) || 20,
                height: (node.dimension && node.dimension.height) || 20
            }, transform: `translate(${node.x - ((node.dimension && node.dimension.width) || 20) / 2 || 0}, ${node.y -
                ((node.dimension && node.dimension.height) || 20) / 2 || 0})` }))));
        this.outputGraph.edges = internalGraph.links
            .map((/**
         * @param {?} edge
         * @return {?}
         */
        edge => {
            /** @type {?} */
            const source = toNode(internalGraph.nodes, edge.source);
            /** @type {?} */
            const target = toNode(internalGraph.nodes, edge.target);
            return Object.assign({}, edge, { source: source.id, target: target.id, points: [
                    ((/** @type {?} */ (source.bounds))).rayIntersection(target.bounds.cx(), target.bounds.cy()),
                    ((/** @type {?} */ (target.bounds))).rayIntersection(source.bounds.cx(), source.bounds.cy())
                ] });
        }))
            .concat(internalGraph.groupLinks.map((/**
         * @param {?} groupLink
         * @return {?}
         */
        groupLink => {
            /** @type {?} */
            const sourceNode = internalGraph.nodes.find((/**
             * @param {?} foundNode
             * @return {?}
             */
            foundNode => ((/** @type {?} */ (foundNode))).id === groupLink.source));
            /** @type {?} */
            const targetNode = internalGraph.nodes.find((/**
             * @param {?} foundNode
             * @return {?}
             */
            foundNode => ((/** @type {?} */ (foundNode))).id === groupLink.target));
            /** @type {?} */
            const source = sourceNode || internalGraph.groups.find((/**
             * @param {?} foundGroup
             * @return {?}
             */
            foundGroup => ((/** @type {?} */ (foundGroup))).id === groupLink.source));
            /** @type {?} */
            const target = targetNode || internalGraph.groups.find((/**
             * @param {?} foundGroup
             * @return {?}
             */
            foundGroup => ((/** @type {?} */ (foundGroup))).id === groupLink.target));
            return Object.assign({}, groupLink, { source: source.id, target: target.id, points: [
                    ((/** @type {?} */ (source.bounds))).rayIntersection(target.bounds.cx(), target.bounds.cy()),
                    ((/** @type {?} */ (target.bounds))).rayIntersection(source.bounds.cx(), source.bounds.cy())
                ] });
        })));
        this.outputGraph.clusters = internalGraph.groups.map((/**
         * @param {?} group
         * @param {?} index
         * @return {?}
         */
        (group, index) => {
            /** @type {?} */
            const inputGroup = this.inputGraph.clusters[index];
            return Object.assign({}, inputGroup, { dimension: {
                    width: group.bounds ? group.bounds.width() : 20,
                    height: group.bounds ? group.bounds.height() : 20
                }, position: {
                    x: group.bounds ? group.bounds.x + group.bounds.width() / 2 : 0,
                    y: group.bounds ? group.bounds.y + group.bounds.height() / 2 : 0
                } });
        }));
        this.outputGraph.edgeLabels = this.outputGraph.edges;
        return this.outputGraph;
    }
    /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    onDragStart(draggingNode, $event) {
        /** @type {?} */
        const nodeIndex = this.outputGraph.nodes.findIndex((/**
         * @param {?} foundNode
         * @return {?}
         */
        foundNode => foundNode.id === draggingNode.id));
        /** @type {?} */
        const node = this.internalGraph.nodes[nodeIndex];
        if (!node) {
            return;
        }
        this.draggingStart = { x: node.x - $event.x, y: node.y - $event.y };
        node.fixed = 1;
        this.settings.force.start();
    }
    /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    onDrag(draggingNode, $event) {
        if (!draggingNode) {
            return;
        }
        /** @type {?} */
        const nodeIndex = this.outputGraph.nodes.findIndex((/**
         * @param {?} foundNode
         * @return {?}
         */
        foundNode => foundNode.id === draggingNode.id));
        /** @type {?} */
        const node = this.internalGraph.nodes[nodeIndex];
        if (!node) {
            return;
        }
        node.x = this.draggingStart.x + $event.x;
        node.y = this.draggingStart.y + $event.y;
    }
    /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    onDragEnd(draggingNode, $event) {
        if (!draggingNode) {
            return;
        }
        /** @type {?} */
        const nodeIndex = this.outputGraph.nodes.findIndex((/**
         * @param {?} foundNode
         * @return {?}
         */
        foundNode => foundNode.id === draggingNode.id));
        /** @type {?} */
        const node = this.internalGraph.nodes[nodeIndex];
        if (!node) {
            return;
        }
        node.fixed = 0;
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sYUZvcmNlRGlyZWN0ZWQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ac3dpbWxhbmUvbmd4LWdyYXBoLyIsInNvdXJjZXMiOlsibGliL2dyYXBoL2xheW91dHMvY29sYUZvcmNlRGlyZWN0ZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUdBLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwQyxPQUFPLEVBQUUsU0FBUyxFQUFrRixNQUFNLFNBQVMsQ0FBQztBQUNwSCxPQUFPLEtBQUssVUFBVSxNQUFNLGFBQWEsQ0FBQztBQUMxQyxPQUFPLEtBQUssT0FBTyxNQUFNLFVBQVUsQ0FBQztBQUNwQyxPQUFPLEtBQUssT0FBTyxNQUFNLFVBQVUsQ0FBQztBQUVwQyxPQUFPLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDOzs7O0FBRzNDLCtDQUtDOzs7SUFKQywwQ0FBMkM7O0lBQzNDLG9EQUFvRzs7SUFDcEcsbURBQW9EOztJQUNwRCxtREFBZ0M7Ozs7O0FBRWxDLCtCQUlDOzs7SUFIQywyQkFBZ0I7O0lBQ2hCLDBCQUFtQjs7SUFDbkIsMEJBQTJCOzs7Ozs7O0FBRTdCLE1BQU0sVUFBVSxNQUFNLENBQUMsS0FBa0IsRUFBRSxPQUEyQjtJQUNwRSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtRQUMvQixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN2QjtJQUNELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxNQUFNLE9BQU8sdUJBQXVCO0lBQXBDO1FBQ0Usb0JBQWUsR0FBOEI7WUFDM0MsS0FBSyxFQUFFLFNBQVMsbUJBQ1gsVUFBVSxFQUNWLE9BQU8sRUFDUCxPQUFPLEVBQ1Y7aUJBQ0MsWUFBWSxDQUFDLEdBQUcsQ0FBQztpQkFDakIsYUFBYSxDQUFDLElBQUksQ0FBQztZQUN0QixjQUFjLEVBQUU7Z0JBQ2QsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsTUFBTSxFQUFFLEdBQUc7Z0JB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RUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssWUFBWSxDQUFDLEVBQUUsRUFBQzs7Y0FDM0YsSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNoRCxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQztDQUNGOzs7SUFwT0Msa0RBYUU7O0lBQ0YsMkNBQXlDOztJQUV6Qyw2Q0FBa0I7O0lBQ2xCLDhDQUFtQjs7SUFDbkIsZ0RBQW1EOztJQUNuRCwrQ0FBNkM7O0lBRTdDLGdEQUF3QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExheW91dCB9IGZyb20gJy4uLy4uL21vZGVscy9sYXlvdXQubW9kZWwnO1xuaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuLi8uLi9tb2RlbHMvZ3JhcGgubW9kZWwnO1xuaW1wb3J0IHsgTm9kZSwgQ2x1c3Rlck5vZGUgfSBmcm9tICcuLi8uLi9tb2RlbHMvbm9kZS5tb2RlbCc7XG5pbXBvcnQgeyBpZCB9IGZyb20gJy4uLy4uL3V0aWxzL2lkJztcbmltcG9ydCB7IGQzYWRhcHRvciwgSUQzU3R5bGVMYXlvdXRBZGFwdG9yLCBMYXlvdXQgYXMgQ29sYUxheW91dCwgR3JvdXAsIElucHV0Tm9kZSwgTGluaywgUmVjdGFuZ2xlIH0gZnJvbSAnd2ViY29sYSc7XG5pbXBvcnQgKiBhcyBkM0Rpc3BhdGNoIGZyb20gJ2QzLWRpc3BhdGNoJztcbmltcG9ydCAqIGFzIGQzRm9yY2UgZnJvbSAnZDMtZm9yY2UnO1xuaW1wb3J0ICogYXMgZDNUaW1lciBmcm9tICdkMy10aW1lcic7XG5pbXBvcnQgeyBFZGdlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VkZ2UubW9kZWwnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgVmlld0RpbWVuc2lvbnMgfSBmcm9tICdAc3dpbWxhbmUvbmd4LWNoYXJ0cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29sYUZvcmNlRGlyZWN0ZWRTZXR0aW5ncyB7XG4gIGZvcmNlPzogQ29sYUxheW91dCAmIElEM1N0eWxlTGF5b3V0QWRhcHRvcjtcbiAgZm9yY2VNb2RpZmllckZuPzogKGZvcmNlOiBDb2xhTGF5b3V0ICYgSUQzU3R5bGVMYXlvdXRBZGFwdG9yKSA9PiBDb2xhTGF5b3V0ICYgSUQzU3R5bGVMYXlvdXRBZGFwdG9yO1xuICBvblRpY2tMaXN0ZW5lcj86IChpbnRlcm5hbEdyYXBoOiBDb2xhR3JhcGgpID0+IHZvaWQ7XG4gIHZpZXdEaW1lbnNpb25zPzogVmlld0RpbWVuc2lvbnM7XG59XG5leHBvcnQgaW50ZXJmYWNlIENvbGFHcmFwaCB7XG4gIGdyb3VwczogR3JvdXBbXTtcbiAgbm9kZXM6IElucHV0Tm9kZVtdO1xuICBsaW5rczogQXJyYXk8TGluazxudW1iZXI+Pjtcbn1cbmV4cG9ydCBmdW5jdGlvbiB0b05vZGUobm9kZXM6IElucHV0Tm9kZVtdLCBub2RlUmVmOiBJbnB1dE5vZGUgfCBudW1iZXIpOiBJbnB1dE5vZGUge1xuICBpZiAodHlwZW9mIG5vZGVSZWYgPT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIG5vZGVzW25vZGVSZWZdO1xuICB9XG4gIHJldHVybiBub2RlUmVmO1xufVxuXG5leHBvcnQgY2xhc3MgQ29sYUZvcmNlRGlyZWN0ZWRMYXlvdXQgaW1wbGVtZW50cyBMYXlvdXQge1xuICBkZWZhdWx0U2V0dGluZ3M6IENvbGFGb3JjZURpcmVjdGVkU2V0dGluZ3MgPSB7XG4gICAgZm9yY2U6IGQzYWRhcHRvcih7XG4gICAgICAuLi5kM0Rpc3BhdGNoLFxuICAgICAgLi4uZDNGb3JjZSxcbiAgICAgIC4uLmQzVGltZXJcbiAgICB9KVxuICAgICAgLmxpbmtEaXN0YW5jZSgxNTApXG4gICAgICAuYXZvaWRPdmVybGFwcyh0cnVlKSxcbiAgICB2aWV3RGltZW5zaW9uczoge1xuICAgICAgd2lkdGg6IDYwMCxcbiAgICAgIGhlaWdodDogNjAwLFxuICAgICAgeE9mZnNldDogMFxuICAgIH1cbiAgfTtcbiAgc2V0dGluZ3M6IENvbGFGb3JjZURpcmVjdGVkU2V0dGluZ3MgPSB7fTtcblxuICBpbnB1dEdyYXBoOiBHcmFwaDtcbiAgb3V0cHV0R3JhcGg6IEdyYXBoO1xuICBpbnRlcm5hbEdyYXBoOiBDb2xhR3JhcGggJiB7IGdyb3VwTGlua3M/OiBFZGdlW10gfTtcbiAgb3V0cHV0R3JhcGgkOiBTdWJqZWN0PEdyYXBoPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgZHJhZ2dpbmdTdGFydDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9O1xuXG4gIHJ1bihncmFwaDogR3JhcGgpOiBPYnNlcnZhYmxlPEdyYXBoPiB7XG4gICAgdGhpcy5pbnB1dEdyYXBoID0gZ3JhcGg7XG4gICAgaWYgKCF0aGlzLmlucHV0R3JhcGguY2x1c3RlcnMpIHtcbiAgICAgIHRoaXMuaW5wdXRHcmFwaC5jbHVzdGVycyA9IFtdO1xuICAgIH1cbiAgICB0aGlzLmludGVybmFsR3JhcGggPSB7XG4gICAgICBub2RlczogW1xuICAgICAgICAuLi50aGlzLmlucHV0R3JhcGgubm9kZXMubWFwKG4gPT4gKHtcbiAgICAgICAgICAuLi5uLFxuICAgICAgICAgIHdpZHRoOiBuLmRpbWVuc2lvbiA/IG4uZGltZW5zaW9uLndpZHRoIDogMjAsXG4gICAgICAgICAgaGVpZ2h0OiBuLmRpbWVuc2lvbiA/IG4uZGltZW5zaW9uLmhlaWdodCA6IDIwXG4gICAgICAgIH0pKVxuICAgICAgXSBhcyBhbnksXG4gICAgICBncm91cHM6IFtcbiAgICAgICAgLi4udGhpcy5pbnB1dEdyYXBoLmNsdXN0ZXJzLm1hcChcbiAgICAgICAgICAoY2x1c3Rlcik6IEdyb3VwID0+ICh7XG4gICAgICAgICAgICBwYWRkaW5nOiA1LFxuICAgICAgICAgICAgZ3JvdXBzOiBjbHVzdGVyLmNoaWxkTm9kZUlkc1xuICAgICAgICAgICAgICAubWFwKG5vZGVJZCA9PiA8YW55PnRoaXMuaW5wdXRHcmFwaC5jbHVzdGVycy5maW5kSW5kZXgobm9kZSA9PiBub2RlLmlkID09PSBub2RlSWQpKVxuICAgICAgICAgICAgICAuZmlsdGVyKHggPT4geCA+PSAwKSxcbiAgICAgICAgICAgIGxlYXZlczogY2x1c3Rlci5jaGlsZE5vZGVJZHNcbiAgICAgICAgICAgICAgLm1hcChub2RlSWQgPT4gPGFueT50aGlzLmlucHV0R3JhcGgubm9kZXMuZmluZEluZGV4KG5vZGUgPT4gbm9kZS5pZCA9PT0gbm9kZUlkKSlcbiAgICAgICAgICAgICAgLmZpbHRlcih4ID0+IHggPj0gMClcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICBdLFxuICAgICAgbGlua3M6IFtcbiAgICAgICAgLi4udGhpcy5pbnB1dEdyYXBoLmVkZ2VzXG4gICAgICAgICAgLm1hcChlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZU5vZGVJbmRleCA9IHRoaXMuaW5wdXRHcmFwaC5ub2Rlcy5maW5kSW5kZXgobm9kZSA9PiBlLnNvdXJjZSA9PT0gbm9kZS5pZCk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXROb2RlSW5kZXggPSB0aGlzLmlucHV0R3JhcGgubm9kZXMuZmluZEluZGV4KG5vZGUgPT4gZS50YXJnZXQgPT09IG5vZGUuaWQpO1xuICAgICAgICAgICAgaWYgKHNvdXJjZU5vZGVJbmRleCA9PT0gLTEgfHwgdGFyZ2V0Tm9kZUluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgLi4uZSxcbiAgICAgICAgICAgICAgc291cmNlOiBzb3VyY2VOb2RlSW5kZXgsXG4gICAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0Tm9kZUluZGV4XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbHRlcih4ID0+ICEheClcbiAgICAgIF0gYXMgYW55LFxuICAgICAgZ3JvdXBMaW5rczogW1xuICAgICAgICAuLi50aGlzLmlucHV0R3JhcGguZWRnZXNcbiAgICAgICAgICAubWFwKGUgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlTm9kZUluZGV4ID0gdGhpcy5pbnB1dEdyYXBoLm5vZGVzLmZpbmRJbmRleChub2RlID0+IGUuc291cmNlID09PSBub2RlLmlkKTtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldE5vZGVJbmRleCA9IHRoaXMuaW5wdXRHcmFwaC5ub2Rlcy5maW5kSW5kZXgobm9kZSA9PiBlLnRhcmdldCA9PT0gbm9kZS5pZCk7XG4gICAgICAgICAgICBpZiAoc291cmNlTm9kZUluZGV4ID49IDAgJiYgdGFyZ2V0Tm9kZUluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbHRlcih4ID0+ICEheClcbiAgICAgIF1cbiAgICB9O1xuICAgIHRoaXMub3V0cHV0R3JhcGggPSB7XG4gICAgICBub2RlczogW10sXG4gICAgICBjbHVzdGVyczogW10sXG4gICAgICBlZGdlczogW10sXG4gICAgICBlZGdlTGFiZWxzOiBbXVxuICAgIH07XG4gICAgdGhpcy5vdXRwdXRHcmFwaCQubmV4dCh0aGlzLm91dHB1dEdyYXBoKTtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0U2V0dGluZ3MsIHRoaXMuc2V0dGluZ3MpO1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmZvcmNlKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLmZvcmNlID0gdGhpcy5zZXR0aW5ncy5mb3JjZVxuICAgICAgICAubm9kZXModGhpcy5pbnRlcm5hbEdyYXBoLm5vZGVzKVxuICAgICAgICAuZ3JvdXBzKHRoaXMuaW50ZXJuYWxHcmFwaC5ncm91cHMpXG4gICAgICAgIC5saW5rcyh0aGlzLmludGVybmFsR3JhcGgubGlua3MpXG4gICAgICAgIC5hbHBoYSgwLjUpXG4gICAgICAgIC5vbigndGljaycsICgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5vblRpY2tMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5vblRpY2tMaXN0ZW5lcih0aGlzLmludGVybmFsR3JhcGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLm91dHB1dEdyYXBoJC5uZXh0KHRoaXMuaW50ZXJuYWxHcmFwaFRvT3V0cHV0R3JhcGgodGhpcy5pbnRlcm5hbEdyYXBoKSk7XG4gICAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3Mudmlld0RpbWVuc2lvbnMpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5mb3JjZSA9IHRoaXMuc2V0dGluZ3MuZm9yY2Uuc2l6ZShbXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy52aWV3RGltZW5zaW9ucy53aWR0aCxcbiAgICAgICAgICB0aGlzLnNldHRpbmdzLnZpZXdEaW1lbnNpb25zLmhlaWdodFxuICAgICAgICBdKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLmZvcmNlTW9kaWZpZXJGbikge1xuICAgICAgICB0aGlzLnNldHRpbmdzLmZvcmNlID0gdGhpcy5zZXR0aW5ncy5mb3JjZU1vZGlmaWVyRm4odGhpcy5zZXR0aW5ncy5mb3JjZSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldHRpbmdzLmZvcmNlLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMub3V0cHV0R3JhcGgkLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgdXBkYXRlRWRnZShncmFwaDogR3JhcGgsIGVkZ2U6IEVkZ2UpOiBPYnNlcnZhYmxlPEdyYXBoPiB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmF1bHRTZXR0aW5ncywgdGhpcy5zZXR0aW5ncyk7XG4gICAgaWYgKHNldHRpbmdzLmZvcmNlKSB7XG4gICAgICBzZXR0aW5ncy5mb3JjZS5zdGFydCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm91dHB1dEdyYXBoJC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIGludGVybmFsR3JhcGhUb091dHB1dEdyYXBoKGludGVybmFsR3JhcGg6IGFueSk6IEdyYXBoIHtcbiAgICB0aGlzLm91dHB1dEdyYXBoLm5vZGVzID0gaW50ZXJuYWxHcmFwaC5ub2Rlcy5tYXAobm9kZSA9PiAoe1xuICAgICAgLi4ubm9kZSxcbiAgICAgIGlkOiBub2RlLmlkIHx8IGlkKCksXG4gICAgICBwb3NpdGlvbjoge1xuICAgICAgICB4OiBub2RlLngsXG4gICAgICAgIHk6IG5vZGUueVxuICAgICAgfSxcbiAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICB3aWR0aDogKG5vZGUuZGltZW5zaW9uICYmIG5vZGUuZGltZW5zaW9uLndpZHRoKSB8fCAyMCxcbiAgICAgICAgaGVpZ2h0OiAobm9kZS5kaW1lbnNpb24gJiYgbm9kZS5kaW1lbnNpb24uaGVpZ2h0KSB8fCAyMFxuICAgICAgfSxcbiAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke25vZGUueCAtICgobm9kZS5kaW1lbnNpb24gJiYgbm9kZS5kaW1lbnNpb24ud2lkdGgpIHx8IDIwKSAvIDIgfHwgMH0sICR7bm9kZS55IC1cbiAgICAgICAgKChub2RlLmRpbWVuc2lvbiAmJiBub2RlLmRpbWVuc2lvbi5oZWlnaHQpIHx8IDIwKSAvIDIgfHwgMH0pYFxuICAgIH0pKTtcblxuICAgIHRoaXMub3V0cHV0R3JhcGguZWRnZXMgPSBpbnRlcm5hbEdyYXBoLmxpbmtzXG4gICAgICAubWFwKGVkZ2UgPT4ge1xuICAgICAgICBjb25zdCBzb3VyY2U6IGFueSA9IHRvTm9kZShpbnRlcm5hbEdyYXBoLm5vZGVzLCBlZGdlLnNvdXJjZSk7XG4gICAgICAgIGNvbnN0IHRhcmdldDogYW55ID0gdG9Ob2RlKGludGVybmFsR3JhcGgubm9kZXMsIGVkZ2UudGFyZ2V0KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5lZGdlLFxuICAgICAgICAgIHNvdXJjZTogc291cmNlLmlkLFxuICAgICAgICAgIHRhcmdldDogdGFyZ2V0LmlkLFxuICAgICAgICAgIHBvaW50czogW1xuICAgICAgICAgICAgKHNvdXJjZS5ib3VuZHMgYXMgUmVjdGFuZ2xlKS5yYXlJbnRlcnNlY3Rpb24odGFyZ2V0LmJvdW5kcy5jeCgpLCB0YXJnZXQuYm91bmRzLmN5KCkpLFxuICAgICAgICAgICAgKHRhcmdldC5ib3VuZHMgYXMgUmVjdGFuZ2xlKS5yYXlJbnRlcnNlY3Rpb24oc291cmNlLmJvdW5kcy5jeCgpLCBzb3VyY2UuYm91bmRzLmN5KCkpXG4gICAgICAgICAgXVxuICAgICAgICB9O1xuICAgICAgfSlcbiAgICAgIC5jb25jYXQoXG4gICAgICAgIGludGVybmFsR3JhcGguZ3JvdXBMaW5rcy5tYXAoZ3JvdXBMaW5rID0+IHtcbiAgICAgICAgICBjb25zdCBzb3VyY2VOb2RlID0gaW50ZXJuYWxHcmFwaC5ub2Rlcy5maW5kKGZvdW5kTm9kZSA9PiAoZm91bmROb2RlIGFzIGFueSkuaWQgPT09IGdyb3VwTGluay5zb3VyY2UpO1xuICAgICAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSBpbnRlcm5hbEdyYXBoLm5vZGVzLmZpbmQoZm91bmROb2RlID0+IChmb3VuZE5vZGUgYXMgYW55KS5pZCA9PT0gZ3JvdXBMaW5rLnRhcmdldCk7XG4gICAgICAgICAgY29uc3Qgc291cmNlID1cbiAgICAgICAgICAgIHNvdXJjZU5vZGUgfHwgaW50ZXJuYWxHcmFwaC5ncm91cHMuZmluZChmb3VuZEdyb3VwID0+IChmb3VuZEdyb3VwIGFzIGFueSkuaWQgPT09IGdyb3VwTGluay5zb3VyY2UpO1xuICAgICAgICAgIGNvbnN0IHRhcmdldCA9XG4gICAgICAgICAgICB0YXJnZXROb2RlIHx8IGludGVybmFsR3JhcGguZ3JvdXBzLmZpbmQoZm91bmRHcm91cCA9PiAoZm91bmRHcm91cCBhcyBhbnkpLmlkID09PSBncm91cExpbmsudGFyZ2V0KTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uZ3JvdXBMaW5rLFxuICAgICAgICAgICAgc291cmNlOiBzb3VyY2UuaWQsXG4gICAgICAgICAgICB0YXJnZXQ6IHRhcmdldC5pZCxcbiAgICAgICAgICAgIHBvaW50czogW1xuICAgICAgICAgICAgICAoc291cmNlLmJvdW5kcyBhcyBSZWN0YW5nbGUpLnJheUludGVyc2VjdGlvbih0YXJnZXQuYm91bmRzLmN4KCksIHRhcmdldC5ib3VuZHMuY3koKSksXG4gICAgICAgICAgICAgICh0YXJnZXQuYm91bmRzIGFzIFJlY3RhbmdsZSkucmF5SW50ZXJzZWN0aW9uKHNvdXJjZS5ib3VuZHMuY3goKSwgc291cmNlLmJvdW5kcy5jeSgpKVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH07XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgdGhpcy5vdXRwdXRHcmFwaC5jbHVzdGVycyA9IGludGVybmFsR3JhcGguZ3JvdXBzLm1hcChcbiAgICAgIChncm91cCwgaW5kZXgpOiBDbHVzdGVyTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IGlucHV0R3JvdXAgPSB0aGlzLmlucHV0R3JhcGguY2x1c3RlcnNbaW5kZXhdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmlucHV0R3JvdXAsXG4gICAgICAgICAgZGltZW5zaW9uOiB7XG4gICAgICAgICAgICB3aWR0aDogZ3JvdXAuYm91bmRzID8gZ3JvdXAuYm91bmRzLndpZHRoKCkgOiAyMCxcbiAgICAgICAgICAgIGhlaWdodDogZ3JvdXAuYm91bmRzID8gZ3JvdXAuYm91bmRzLmhlaWdodCgpIDogMjBcbiAgICAgICAgICB9LFxuICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICB4OiBncm91cC5ib3VuZHMgPyBncm91cC5ib3VuZHMueCArIGdyb3VwLmJvdW5kcy53aWR0aCgpIC8gMiA6IDAsXG4gICAgICAgICAgICB5OiBncm91cC5ib3VuZHMgPyBncm91cC5ib3VuZHMueSArIGdyb3VwLmJvdW5kcy5oZWlnaHQoKSAvIDIgOiAwXG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICk7XG4gICAgdGhpcy5vdXRwdXRHcmFwaC5lZGdlTGFiZWxzID0gdGhpcy5vdXRwdXRHcmFwaC5lZGdlcztcbiAgICByZXR1cm4gdGhpcy5vdXRwdXRHcmFwaDtcbiAgfVxuXG4gIG9uRHJhZ1N0YXJ0KGRyYWdnaW5nTm9kZTogTm9kZSwgJGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZUluZGV4ID0gdGhpcy5vdXRwdXRHcmFwaC5ub2Rlcy5maW5kSW5kZXgoZm91bmROb2RlID0+IGZvdW5kTm9kZS5pZCA9PT0gZHJhZ2dpbmdOb2RlLmlkKTtcbiAgICBjb25zdCBub2RlID0gdGhpcy5pbnRlcm5hbEdyYXBoLm5vZGVzW25vZGVJbmRleF07XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZHJhZ2dpbmdTdGFydCA9IHsgeDogbm9kZS54IC0gJGV2ZW50LngsIHk6IG5vZGUueSAtICRldmVudC55IH07XG4gICAgbm9kZS5maXhlZCA9IDE7XG4gICAgdGhpcy5zZXR0aW5ncy5mb3JjZS5zdGFydCgpO1xuICB9XG5cbiAgb25EcmFnKGRyYWdnaW5nTm9kZTogTm9kZSwgJGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKCFkcmFnZ2luZ05vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgbm9kZUluZGV4ID0gdGhpcy5vdXRwdXRHcmFwaC5ub2Rlcy5maW5kSW5kZXgoZm91bmROb2RlID0+IGZvdW5kTm9kZS5pZCA9PT0gZHJhZ2dpbmdOb2RlLmlkKTtcbiAgICBjb25zdCBub2RlID0gdGhpcy5pbnRlcm5hbEdyYXBoLm5vZGVzW25vZGVJbmRleF07XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5vZGUueCA9IHRoaXMuZHJhZ2dpbmdTdGFydC54ICsgJGV2ZW50Lng7XG4gICAgbm9kZS55ID0gdGhpcy5kcmFnZ2luZ1N0YXJ0LnkgKyAkZXZlbnQueTtcbiAgfVxuXG4gIG9uRHJhZ0VuZChkcmFnZ2luZ05vZGU6IE5vZGUsICRldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmICghZHJhZ2dpbmdOb2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5vZGVJbmRleCA9IHRoaXMub3V0cHV0R3JhcGgubm9kZXMuZmluZEluZGV4KGZvdW5kTm9kZSA9PiBmb3VuZE5vZGUuaWQgPT09IGRyYWdnaW5nTm9kZS5pZCk7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuaW50ZXJuYWxHcmFwaC5ub2Rlc1tub2RlSW5kZXhdO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG5vZGUuZml4ZWQgPSAwO1xuICB9XG59XG4iXX0=