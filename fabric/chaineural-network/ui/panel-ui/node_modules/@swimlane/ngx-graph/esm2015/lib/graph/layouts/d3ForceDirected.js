/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
export class D3ForceDirectedLayout {
    constructor() {
        this.defaultSettings = {
            force: forceSimulation()
                .force('charge', forceManyBody().strength(-150))
                .force('collide', forceCollide(5)),
            forceLink: forceLink()
                .id((/**
             * @param {?} node
             * @return {?}
             */
            node => node.id))
                .distance((/**
             * @return {?}
             */
            () => 100))
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
        this.d3Graph = {
            nodes: (/** @type {?} */ ([...this.inputGraph.nodes.map((/**
                 * @param {?} n
                 * @return {?}
                 */
                n => (Object.assign({}, n))))])),
            edges: (/** @type {?} */ ([...this.inputGraph.edges.map((/**
                 * @param {?} e
                 * @return {?}
                 */
                e => (Object.assign({}, e))))]))
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
            () => {
                this.outputGraph$.next(this.d3GraphToOutputGraph(this.d3Graph));
            }));
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
            settings.force
                .nodes(this.d3Graph.nodes)
                .force('link', settings.forceLink.links(this.d3Graph.edges))
                .alpha(0.5)
                .restart()
                .on('tick', (/**
             * @return {?}
             */
            () => {
                this.outputGraph$.next(this.d3GraphToOutputGraph(this.d3Graph));
            }));
        }
        return this.outputGraph$.asObservable();
    }
    /**
     * @param {?} d3Graph
     * @return {?}
     */
    d3GraphToOutputGraph(d3Graph) {
        this.outputGraph.nodes = this.d3Graph.nodes.map((/**
         * @param {?} node
         * @return {?}
         */
        (node) => (Object.assign({}, node, { id: node.id || id(), position: {
                x: node.x,
                y: node.y
            }, dimension: {
                width: (node.dimension && node.dimension.width) || 20,
                height: (node.dimension && node.dimension.height) || 20
            }, transform: `translate(${node.x - ((node.dimension && node.dimension.width) || 20) / 2 || 0}, ${node.y -
                ((node.dimension && node.dimension.height) || 20) / 2 || 0})` }))));
        this.outputGraph.edges = this.d3Graph.edges.map((/**
         * @param {?} edge
         * @return {?}
         */
        edge => (Object.assign({}, edge, { source: toD3Node(edge.source).id, target: toD3Node(edge.target).id, points: [
                {
                    x: toD3Node(edge.source).x,
                    y: toD3Node(edge.source).y
                },
                {
                    x: toD3Node(edge.target).x,
                    y: toD3Node(edge.target).y
                }
            ] }))));
        this.outputGraph.edgeLabels = this.outputGraph.edges;
        return this.outputGraph;
    }
    /**
     * @param {?} draggingNode
     * @param {?} $event
     * @return {?}
     */
    onDragStart(draggingNode, $event) {
        this.settings.force.alphaTarget(0.3).restart();
        /** @type {?} */
        const node = this.d3Graph.nodes.find((/**
         * @param {?} d3Node
         * @return {?}
         */
        d3Node => d3Node.id === draggingNode.id));
        if (!node) {
            return;
        }
        this.draggingStart = { x: $event.x - node.x, y: $event.y - node.y };
        node.fx = $event.x - this.draggingStart.x;
        node.fy = $event.y - this.draggingStart.y;
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
        const node = this.d3Graph.nodes.find((/**
         * @param {?} d3Node
         * @return {?}
         */
        d3Node => d3Node.id === draggingNode.id));
        if (!node) {
            return;
        }
        node.fx = $event.x - this.draggingStart.x;
        node.fy = $event.y - this.draggingStart.y;
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
        const node = this.d3Graph.nodes.find((/**
         * @param {?} d3Node
         * @return {?}
         */
        d3Node => d3Node.id === draggingNode.id));
        if (!node) {
            return;
        }
        this.settings.force.alphaTarget(0);
        node.fx = undefined;
        node.fy = undefined;
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZDNGb3JjZURpcmVjdGVkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHN3aW1sYW5lL25neC1ncmFwaC8iLCJzb3VyY2VzIjpbImxpYi9ncmFwaC9sYXlvdXRzL2QzRm9yY2VEaXJlY3RlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBR0EsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3BDLE9BQU8sRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbkYsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQzs7OztBQUczQyw2Q0FHQzs7O0lBRkMsd0NBQVk7O0lBQ1osNENBQWdCOzs7OztBQUVsQiw0QkFRQzs7O0lBUEMsb0JBQVk7O0lBQ1osbUJBQVU7O0lBQ1YsbUJBQVU7O0lBQ1YsdUJBQWU7O0lBQ2Ysd0JBQWdCOztJQUNoQixvQkFBWTs7SUFDWixvQkFBWTs7Ozs7QUFFZCw0QkFJQzs7O0lBSEMsd0JBQXdCOztJQUN4Qix3QkFBd0I7O0lBQ3hCLDBCQUF1Qjs7Ozs7QUFFekIsNkJBR0M7OztJQUZDLHdCQUFnQjs7SUFDaEIsd0JBQWdCOzs7OztBQUVsQixnQ0FFQzs7O0lBREMsd0JBQVc7Ozs7OztBQUdiLE1BQU0sVUFBVSxRQUFRLENBQUMsU0FBMEI7SUFDakQsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLEVBQUU7UUFDakMsT0FBTztZQUNMLEVBQUUsRUFBRSxTQUFTO1lBQ2IsQ0FBQyxFQUFFLENBQUM7WUFDSixDQUFDLEVBQUUsQ0FBQztTQUNMLENBQUM7S0FDSDtJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRCxNQUFNLE9BQU8scUJBQXFCO0lBQWxDO1FBQ0Usb0JBQWUsR0FBNEI7WUFDekMsS0FBSyxFQUFFLGVBQWUsRUFBTztpQkFDMUIsS0FBSyxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMs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QUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUNwQixJQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztJQUN0QixDQUFDO0NBQ0Y7OztJQXBJQyxnREFPRTs7SUFDRix5Q0FBdUM7O0lBRXZDLDJDQUFrQjs7SUFDbEIsNENBQW1COztJQUNuQix3Q0FBaUI7O0lBQ2pCLDZDQUE2Qzs7SUFFN0MsOENBQXdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTGF5b3V0IH0gZnJvbSAnLi4vLi4vbW9kZWxzL2xheW91dC5tb2RlbCc7XG5pbXBvcnQgeyBHcmFwaCB9IGZyb20gJy4uLy4uL21vZGVscy9ncmFwaC5tb2RlbCc7XG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL25vZGUubW9kZWwnO1xuaW1wb3J0IHsgaWQgfSBmcm9tICcuLi8uLi91dGlscy9pZCc7XG5pbXBvcnQgeyBmb3JjZUNvbGxpZGUsIGZvcmNlTGluaywgZm9yY2VNYW55Qm9keSwgZm9yY2VTaW11bGF0aW9uIH0gZnJvbSAnZDMtZm9yY2UnO1xuaW1wb3J0IHsgRWRnZSB9IGZyb20gJy4uLy4uL21vZGVscy9lZGdlLm1vZGVsJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IE5vZGVQb3NpdGlvbiB9IGZyb20gJy4uLy4uL21vZGVscyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRDNGb3JjZURpcmVjdGVkU2V0dGluZ3Mge1xuICBmb3JjZT86IGFueTtcbiAgZm9yY2VMaW5rPzogYW55O1xufVxuZXhwb3J0IGludGVyZmFjZSBEM05vZGUge1xuICBpZD86IHN0cmluZztcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIHdpZHRoPzogbnVtYmVyO1xuICBoZWlnaHQ/OiBudW1iZXI7XG4gIGZ4PzogbnVtYmVyO1xuICBmeT86IG51bWJlcjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRDNFZGdlIHtcbiAgc291cmNlOiBzdHJpbmcgfCBEM05vZGU7XG4gIHRhcmdldDogc3RyaW5nIHwgRDNOb2RlO1xuICBtaWRQb2ludDogTm9kZVBvc2l0aW9uO1xufVxuZXhwb3J0IGludGVyZmFjZSBEM0dyYXBoIHtcbiAgbm9kZXM6IEQzTm9kZVtdO1xuICBlZGdlczogRDNFZGdlW107XG59XG5leHBvcnQgaW50ZXJmYWNlIE1lcmdlZE5vZGUgZXh0ZW5kcyBEM05vZGUsIE5vZGUge1xuICBpZDogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9EM05vZGUobWF5YmVOb2RlOiBzdHJpbmcgfCBEM05vZGUpOiBEM05vZGUge1xuICBpZiAodHlwZW9mIG1heWJlTm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IG1heWJlTm9kZSxcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwXG4gICAgfTtcbiAgfVxuICByZXR1cm4gbWF5YmVOb2RlO1xufVxuXG5leHBvcnQgY2xhc3MgRDNGb3JjZURpcmVjdGVkTGF5b3V0IGltcGxlbWVudHMgTGF5b3V0IHtcbiAgZGVmYXVsdFNldHRpbmdzOiBEM0ZvcmNlRGlyZWN0ZWRTZXR0aW5ncyA9IHtcbiAgICBmb3JjZTogZm9yY2VTaW11bGF0aW9uPGFueT4oKVxuICAgICAgLmZvcmNlKCdjaGFyZ2UnLCBmb3JjZU1hbnlCb2R5KCkuc3RyZW5ndGgoLTE1MCkpXG4gICAgICAuZm9yY2UoJ2NvbGxpZGUnLCBmb3JjZUNvbGxpZGUoNSkpLFxuICAgIGZvcmNlTGluazogZm9yY2VMaW5rPGFueSwgYW55PigpXG4gICAgICAuaWQobm9kZSA9PiBub2RlLmlkKVxuICAgICAgLmRpc3RhbmNlKCgpID0+IDEwMClcbiAgfTtcbiAgc2V0dGluZ3M6IEQzRm9yY2VEaXJlY3RlZFNldHRpbmdzID0ge307XG5cbiAgaW5wdXRHcmFwaDogR3JhcGg7XG4gIG91dHB1dEdyYXBoOiBHcmFwaDtcbiAgZDNHcmFwaDogRDNHcmFwaDtcbiAgb3V0cHV0R3JhcGgkOiBTdWJqZWN0PEdyYXBoPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgZHJhZ2dpbmdTdGFydDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9O1xuXG4gIHJ1bihncmFwaDogR3JhcGgpOiBPYnNlcnZhYmxlPEdyYXBoPiB7XG4gICAgdGhpcy5pbnB1dEdyYXBoID0gZ3JhcGg7XG4gICAgdGhpcy5kM0dyYXBoID0ge1xuICAgICAgbm9kZXM6IFsuLi50aGlzLmlucHV0R3JhcGgubm9kZXMubWFwKG4gPT4gKHsgLi4ubiB9KSldIGFzIGFueSxcbiAgICAgIGVkZ2VzOiBbLi4udGhpcy5pbnB1dEdyYXBoLmVkZ2VzLm1hcChlID0+ICh7IC4uLmUgfSkpXSBhcyBhbnlcbiAgICB9O1xuICAgIHRoaXMub3V0cHV0R3JhcGggPSB7XG4gICAgICBub2RlczogW10sXG4gICAgICBlZGdlczogW10sXG4gICAgICBlZGdlTGFiZWxzOiBbXVxuICAgIH07XG4gICAgdGhpcy5vdXRwdXRHcmFwaCQubmV4dCh0aGlzLm91dHB1dEdyYXBoKTtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0U2V0dGluZ3MsIHRoaXMuc2V0dGluZ3MpO1xuICAgIGlmICh0aGlzLnNldHRpbmdzLmZvcmNlKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLmZvcmNlXG4gICAgICAgIC5ub2Rlcyh0aGlzLmQzR3JhcGgubm9kZXMpXG4gICAgICAgIC5mb3JjZSgnbGluaycsIHRoaXMuc2V0dGluZ3MuZm9yY2VMaW5rLmxpbmtzKHRoaXMuZDNHcmFwaC5lZGdlcykpXG4gICAgICAgIC5hbHBoYSgwLjUpXG4gICAgICAgIC5yZXN0YXJ0KClcbiAgICAgICAgLm9uKCd0aWNrJywgKCkgPT4ge1xuICAgICAgICAgIHRoaXMub3V0cHV0R3JhcGgkLm5leHQodGhpcy5kM0dyYXBoVG9PdXRwdXRHcmFwaCh0aGlzLmQzR3JhcGgpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMub3V0cHV0R3JhcGgkLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgdXBkYXRlRWRnZShncmFwaDogR3JhcGgsIGVkZ2U6IEVkZ2UpOiBPYnNlcnZhYmxlPEdyYXBoPiB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmF1bHRTZXR0aW5ncywgdGhpcy5zZXR0aW5ncyk7XG4gICAgaWYgKHNldHRpbmdzLmZvcmNlKSB7XG4gICAgICBzZXR0aW5ncy5mb3JjZVxuICAgICAgICAubm9kZXModGhpcy5kM0dyYXBoLm5vZGVzKVxuICAgICAgICAuZm9yY2UoJ2xpbmsnLCBzZXR0aW5ncy5mb3JjZUxpbmsubGlua3ModGhpcy5kM0dyYXBoLmVkZ2VzKSlcbiAgICAgICAgLmFscGhhKDAuNSlcbiAgICAgICAgLnJlc3RhcnQoKVxuICAgICAgICAub24oJ3RpY2snLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5vdXRwdXRHcmFwaCQubmV4dCh0aGlzLmQzR3JhcGhUb091dHB1dEdyYXBoKHRoaXMuZDNHcmFwaCkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5vdXRwdXRHcmFwaCQuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBkM0dyYXBoVG9PdXRwdXRHcmFwaChkM0dyYXBoOiBEM0dyYXBoKTogR3JhcGgge1xuICAgIHRoaXMub3V0cHV0R3JhcGgubm9kZXMgPSB0aGlzLmQzR3JhcGgubm9kZXMubWFwKChub2RlOiBNZXJnZWROb2RlKSA9PiAoe1xuICAgICAgLi4ubm9kZSxcbiAgICAgIGlkOiBub2RlLmlkIHx8IGlkKCksXG4gICAgICBwb3NpdGlvbjoge1xuICAgICAgICB4OiBub2RlLngsXG4gICAgICAgIHk6IG5vZGUueVxuICAgICAgfSxcbiAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICB3aWR0aDogKG5vZGUuZGltZW5zaW9uICYmIG5vZGUuZGltZW5zaW9uLndpZHRoKSB8fCAyMCxcbiAgICAgICAgaGVpZ2h0OiAobm9kZS5kaW1lbnNpb24gJiYgbm9kZS5kaW1lbnNpb24uaGVpZ2h0KSB8fCAyMFxuICAgICAgfSxcbiAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke25vZGUueCAtICgobm9kZS5kaW1lbnNpb24gJiYgbm9kZS5kaW1lbnNpb24ud2lkdGgpIHx8IDIwKSAvIDIgfHwgMH0sICR7bm9kZS55IC1cbiAgICAgICAgKChub2RlLmRpbWVuc2lvbiAmJiBub2RlLmRpbWVuc2lvbi5oZWlnaHQpIHx8IDIwKSAvIDIgfHwgMH0pYFxuICAgIH0pKTtcblxuICAgIHRoaXMub3V0cHV0R3JhcGguZWRnZXMgPSB0aGlzLmQzR3JhcGguZWRnZXMubWFwKGVkZ2UgPT4gKHtcbiAgICAgIC4uLmVkZ2UsXG4gICAgICBzb3VyY2U6IHRvRDNOb2RlKGVkZ2Uuc291cmNlKS5pZCxcbiAgICAgIHRhcmdldDogdG9EM05vZGUoZWRnZS50YXJnZXQpLmlkLFxuICAgICAgcG9pbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB4OiB0b0QzTm9kZShlZGdlLnNvdXJjZSkueCxcbiAgICAgICAgICB5OiB0b0QzTm9kZShlZGdlLnNvdXJjZSkueVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgeDogdG9EM05vZGUoZWRnZS50YXJnZXQpLngsXG4gICAgICAgICAgeTogdG9EM05vZGUoZWRnZS50YXJnZXQpLnlcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pKTtcblxuICAgIHRoaXMub3V0cHV0R3JhcGguZWRnZUxhYmVscyA9IHRoaXMub3V0cHV0R3JhcGguZWRnZXM7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0R3JhcGg7XG4gIH1cblxuICBvbkRyYWdTdGFydChkcmFnZ2luZ05vZGU6IE5vZGUsICRldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuc2V0dGluZ3MuZm9yY2UuYWxwaGFUYXJnZXQoMC4zKS5yZXN0YXJ0KCk7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuZDNHcmFwaC5ub2Rlcy5maW5kKGQzTm9kZSA9PiBkM05vZGUuaWQgPT09IGRyYWdnaW5nTm9kZS5pZCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZHJhZ2dpbmdTdGFydCA9IHsgeDogJGV2ZW50LnggLSBub2RlLngsIHk6ICRldmVudC55IC0gbm9kZS55IH07XG4gICAgbm9kZS5meCA9ICRldmVudC54IC0gdGhpcy5kcmFnZ2luZ1N0YXJ0Lng7XG4gICAgbm9kZS5meSA9ICRldmVudC55IC0gdGhpcy5kcmFnZ2luZ1N0YXJ0Lnk7XG4gIH1cblxuICBvbkRyYWcoZHJhZ2dpbmdOb2RlOiBOb2RlLCAkZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoIWRyYWdnaW5nTm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBub2RlID0gdGhpcy5kM0dyYXBoLm5vZGVzLmZpbmQoZDNOb2RlID0+IGQzTm9kZS5pZCA9PT0gZHJhZ2dpbmdOb2RlLmlkKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbm9kZS5meCA9ICRldmVudC54IC0gdGhpcy5kcmFnZ2luZ1N0YXJ0Lng7XG4gICAgbm9kZS5meSA9ICRldmVudC55IC0gdGhpcy5kcmFnZ2luZ1N0YXJ0Lnk7XG4gIH1cblxuICBvbkRyYWdFbmQoZHJhZ2dpbmdOb2RlOiBOb2RlLCAkZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAoIWRyYWdnaW5nTm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBub2RlID0gdGhpcy5kM0dyYXBoLm5vZGVzLmZpbmQoZDNOb2RlID0+IGQzTm9kZS5pZCA9PT0gZHJhZ2dpbmdOb2RlLmlkKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNldHRpbmdzLmZvcmNlLmFscGhhVGFyZ2V0KDApO1xuICAgIG5vZGUuZnggPSB1bmRlZmluZWQ7XG4gICAgbm9kZS5meSA9IHVuZGVmaW5lZDtcbiAgfVxufVxuIl19