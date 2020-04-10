/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { id } from '../../utils/id';
import * as dagre from 'dagre';
/** @enum {string} */
const Orientation = {
    LEFT_TO_RIGHT: 'LR',
    RIGHT_TO_LEFT: 'RL',
    TOP_TO_BOTTOM: 'TB',
    BOTTOM_TO_TOM: 'BT',
};
export { Orientation };
/** @enum {string} */
const Alignment = {
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
export class DagreLayout {
    constructor() {
        this.defaultSettings = {
            orientation: Orientation.LEFT_TO_RIGHT,
            marginX: 20,
            marginY: 20,
            edgePadding: 100,
            rankPadding: 100,
            nodePadding: 50,
            multigraph: true,
            compound: true
        };
        this.settings = {};
    }
    /**
     * @param {?} graph
     * @return {?}
     */
    run(graph) {
        this.createDagreGraph(graph);
        dagre.layout(this.dagreGraph);
        graph.edgeLabels = this.dagreGraph._edgeLabels;
        for (const dagreNodeId in this.dagreGraph._nodes) {
            /** @type {?} */
            const dagreNode = this.dagreGraph._nodes[dagreNodeId];
            /** @type {?} */
            const node = graph.nodes.find((/**
             * @param {?} n
             * @return {?}
             */
            n => n.id === dagreNode.id));
            node.position = {
                x: dagreNode.x,
                y: dagreNode.y
            };
            node.dimension = {
                width: dagreNode.width,
                height: dagreNode.height
            };
        }
        return graph;
    }
    /**
     * @param {?} graph
     * @param {?} edge
     * @return {?}
     */
    updateEdge(graph, edge) {
        /** @type {?} */
        const sourceNode = graph.nodes.find((/**
         * @param {?} n
         * @return {?}
         */
        n => n.id === edge.source));
        /** @type {?} */
        const targetNode = graph.nodes.find((/**
         * @param {?} n
         * @return {?}
         */
        n => n.id === edge.target));
        // determine new arrow position
        /** @type {?} */
        const dir = sourceNode.position.y <= targetNode.position.y ? -1 : 1;
        /** @type {?} */
        const startingPoint = {
            x: sourceNode.position.x,
            y: sourceNode.position.y - dir * (sourceNode.dimension.height / 2)
        };
        /** @type {?} */
        const endingPoint = {
            x: targetNode.position.x,
            y: targetNode.position.y + dir * (targetNode.dimension.height / 2)
        };
        // generate new points
        edge.points = [startingPoint, endingPoint];
        return graph;
    }
    /**
     * @param {?} graph
     * @return {?}
     */
    createDagreGraph(graph) {
        /** @type {?} */
        const settings = Object.assign({}, this.defaultSettings, this.settings);
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
        () => {
            return {
            /* empty */
            };
        }));
        this.dagreNodes = graph.nodes.map((/**
         * @param {?} n
         * @return {?}
         */
        n => {
            /** @type {?} */
            const node = Object.assign({}, n);
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
        l => {
            /** @type {?} */
            const newLink = Object.assign({}, l);
            if (!newLink.id) {
                newLink.id = id();
            }
            return newLink;
        }));
        for (const node of this.dagreNodes) {
            if (!node.width) {
                node.width = 20;
            }
            if (!node.height) {
                node.height = 30;
            }
            // update dagre
            this.dagreGraph.setNode(node.id, node);
        }
        // update dagre
        for (const edge of this.dagreEdges) {
            if (settings.multigraph) {
                this.dagreGraph.setEdge(edge.source, edge.target, edge, edge.id);
            }
            else {
                this.dagreGraph.setEdge(edge.source, edge.target);
            }
        }
        return this.dagreGraph;
    }
}
if (false) {
    /** @type {?} */
    DagreLayout.prototype.defaultSettings;
    /** @type {?} */
    DagreLayout.prototype.settings;
    /** @type {?} */
    DagreLayout.prototype.dagreGraph;
    /** @type {?} */
    DagreLayout.prototype.dagreNodes;
    /** @type {?} */
    DagreLayout.prototype.dagreEdges;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFncmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ac3dpbWxhbmUvbmd4LWdyYXBoLyIsInNvdXJjZXMiOlsibGliL2dyYXBoL2xheW91dHMvZGFncmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwQyxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQzs7O0lBSTdCLGVBQWdCLElBQUk7SUFDcEIsZUFBZ0IsSUFBSTtJQUNwQixlQUFnQixJQUFJO0lBQ3BCLGVBQWdCLElBQUk7Ozs7O0lBR3BCLFFBQVMsR0FBRztJQUNaLFNBQVUsSUFBSTtJQUNkLFVBQVcsSUFBSTtJQUNmLFdBQVksSUFBSTtJQUNoQixZQUFhLElBQUk7Ozs7OztBQUduQixtQ0FZQzs7O0lBWEMsb0NBQTBCOztJQUMxQixnQ0FBaUI7O0lBQ2pCLGdDQUFpQjs7SUFDakIsb0NBQXFCOztJQUNyQixvQ0FBcUI7O0lBQ3JCLG9DQUFxQjs7SUFDckIsOEJBQWtCOztJQUNsQixrQ0FBaUM7O0lBQ2pDLCtCQUEyRDs7SUFDM0QsbUNBQXFCOztJQUNyQixpQ0FBbUI7O0FBR3JCLE1BQU0sT0FBTyxXQUFXO0lBQXhCO1FBQ0Usb0JBQWUsR0FBa0I7WUFDL0IsV0FBVyxFQUFFLFdBQVcsQ0FBQyxhQUFhO1lBQ3RDLE9BQU8sRUFBRSxFQUFFO1lBQ1gsT0FBTyxFQUFFLEVBQUU7WUFDWCxXQUFXLEVBQUUsR0FBRztZQUNoQixXQUFXLEVBQUUsR0FBRztZQUNoQixXQUFXLEVBQUUsRUFBRTtZQUNmLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFFBQVEsRUFBRSxJQUFJO1NBQ2YsQ0FBQztRQUNGLGFBQVEsR0FBa0IsRUFBRSxDQUFDO0lBaUgvQixDQUFDOzs7OztJQTNHQyxHQUFHLENBQUMsS0FBWTtRQUNkLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFD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QUNuQjtZQUNELE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUMsRUFBQyxDQUFDO1FBRUgsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO2FBQ2xCO1lBRUQsZUFBZTtZQUNmLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDeEM7UUFFRCxlQUFlO1FBQ2YsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2xDLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDbEU7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbkQ7U0FDRjtRQUVELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN6QixDQUFDO0NBQ0Y7OztJQTNIQyxzQ0FTRTs7SUFDRiwrQkFBNkI7O0lBRTdCLGlDQUFnQjs7SUFDaEIsaUNBQWdCOztJQUNoQixpQ0FBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMYXlvdXQgfSBmcm9tICcuLi8uLi9tb2RlbHMvbGF5b3V0Lm1vZGVsJztcbmltcG9ydCB7IEdyYXBoIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2dyYXBoLm1vZGVsJztcbmltcG9ydCB7IGlkIH0gZnJvbSAnLi4vLi4vdXRpbHMvaWQnO1xuaW1wb3J0ICogYXMgZGFncmUgZnJvbSAnZGFncmUnO1xuaW1wb3J0IHsgRWRnZSB9IGZyb20gJy4uLy4uL21vZGVscy9lZGdlLm1vZGVsJztcblxuZXhwb3J0IGVudW0gT3JpZW50YXRpb24ge1xuICBMRUZUX1RPX1JJR0hUID0gJ0xSJyxcbiAgUklHSFRfVE9fTEVGVCA9ICdSTCcsXG4gIFRPUF9UT19CT1RUT00gPSAnVEInLFxuICBCT1RUT01fVE9fVE9NID0gJ0JUJ1xufVxuZXhwb3J0IGVudW0gQWxpZ25tZW50IHtcbiAgQ0VOVEVSID0gJ0MnLFxuICBVUF9MRUZUID0gJ1VMJyxcbiAgVVBfUklHSFQgPSAnVVInLFxuICBET1dOX0xFRlQgPSAnREwnLFxuICBET1dOX1JJR0hUID0gJ0RSJ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERhZ3JlU2V0dGluZ3Mge1xuICBvcmllbnRhdGlvbj86IE9yaWVudGF0aW9uO1xuICBtYXJnaW5YPzogbnVtYmVyO1xuICBtYXJnaW5ZPzogbnVtYmVyO1xuICBlZGdlUGFkZGluZz86IG51bWJlcjtcbiAgcmFua1BhZGRpbmc/OiBudW1iZXI7XG4gIG5vZGVQYWRkaW5nPzogbnVtYmVyO1xuICBhbGlnbj86IEFsaWdubWVudDtcbiAgYWN5Y2xpY2VyPzogJ2dyZWVkeScgfCB1bmRlZmluZWQ7XG4gIHJhbmtlcj86ICduZXR3b3JrLXNpbXBsZXgnIHwgJ3RpZ2h0LXRyZWUnIHwgJ2xvbmdlc3QtcGF0aCc7XG4gIG11bHRpZ3JhcGg/OiBib29sZWFuO1xuICBjb21wb3VuZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBEYWdyZUxheW91dCBpbXBsZW1lbnRzIExheW91dCB7XG4gIGRlZmF1bHRTZXR0aW5nczogRGFncmVTZXR0aW5ncyA9IHtcbiAgICBvcmllbnRhdGlvbjogT3JpZW50YXRpb24uTEVGVF9UT19SSUdIVCxcbiAgICBtYXJnaW5YOiAyMCxcbiAgICBtYXJnaW5ZOiAyMCxcbiAgICBlZGdlUGFkZGluZzogMTAwLFxuICAgIHJhbmtQYWRkaW5nOiAxMDAsXG4gICAgbm9kZVBhZGRpbmc6IDUwLFxuICAgIG11bHRpZ3JhcGg6IHRydWUsXG4gICAgY29tcG91bmQ6IHRydWVcbiAgfTtcbiAgc2V0dGluZ3M6IERhZ3JlU2V0dGluZ3MgPSB7fTtcblxuICBkYWdyZUdyYXBoOiBhbnk7XG4gIGRhZ3JlTm9kZXM6IGFueTtcbiAgZGFncmVFZGdlczogYW55O1xuXG4gIHJ1bihncmFwaDogR3JhcGgpOiBHcmFwaCB7XG4gICAgdGhpcy5jcmVhdGVEYWdyZUdyYXBoKGdyYXBoKTtcbiAgICBkYWdyZS5sYXlvdXQodGhpcy5kYWdyZUdyYXBoKTtcblxuICAgIGdyYXBoLmVkZ2VMYWJlbHMgPSB0aGlzLmRhZ3JlR3JhcGguX2VkZ2VMYWJlbHM7XG5cbiAgICBmb3IgKGNvbnN0IGRhZ3JlTm9kZUlkIGluIHRoaXMuZGFncmVHcmFwaC5fbm9kZXMpIHtcbiAgICAgIGNvbnN0IGRhZ3JlTm9kZSA9IHRoaXMuZGFncmVHcmFwaC5fbm9kZXNbZGFncmVOb2RlSWRdO1xuICAgICAgY29uc3Qgbm9kZSA9IGdyYXBoLm5vZGVzLmZpbmQobiA9PiBuLmlkID09PSBkYWdyZU5vZGUuaWQpO1xuICAgICAgbm9kZS5wb3NpdGlvbiA9IHtcbiAgICAgICAgeDogZGFncmVOb2RlLngsXG4gICAgICAgIHk6IGRhZ3JlTm9kZS55XG4gICAgICB9O1xuICAgICAgbm9kZS5kaW1lbnNpb24gPSB7XG4gICAgICAgIHdpZHRoOiBkYWdyZU5vZGUud2lkdGgsXG4gICAgICAgIGhlaWdodDogZGFncmVOb2RlLmhlaWdodFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ3JhcGg7XG4gIH1cblxuICB1cGRhdGVFZGdlKGdyYXBoOiBHcmFwaCwgZWRnZTogRWRnZSk6IEdyYXBoIHtcbiAgICBjb25zdCBzb3VyY2VOb2RlID0gZ3JhcGgubm9kZXMuZmluZChuID0+IG4uaWQgPT09IGVkZ2Uuc291cmNlKTtcbiAgICBjb25zdCB0YXJnZXROb2RlID0gZ3JhcGgubm9kZXMuZmluZChuID0+IG4uaWQgPT09IGVkZ2UudGFyZ2V0KTtcblxuICAgIC8vIGRldGVybWluZSBuZXcgYXJyb3cgcG9zaXRpb25cbiAgICBjb25zdCBkaXIgPSBzb3VyY2VOb2RlLnBvc2l0aW9uLnkgPD0gdGFyZ2V0Tm9kZS5wb3NpdGlvbi55ID8gLTEgOiAxO1xuICAgIGNvbnN0IHN0YXJ0aW5nUG9pbnQgPSB7XG4gICAgICB4OiBzb3VyY2VOb2RlLnBvc2l0aW9uLngsXG4gICAgICB5OiBzb3VyY2VOb2RlLnBvc2l0aW9uLnkgLSBkaXIgKiAoc291cmNlTm9kZS5kaW1lbnNpb24uaGVpZ2h0IC8gMilcbiAgICB9O1xuICAgIGNvbnN0IGVuZGluZ1BvaW50ID0ge1xuICAgICAgeDogdGFyZ2V0Tm9kZS5wb3NpdGlvbi54LFxuICAgICAgeTogdGFyZ2V0Tm9kZS5wb3NpdGlvbi55ICsgZGlyICogKHRhcmdldE5vZGUuZGltZW5zaW9uLmhlaWdodCAvIDIpXG4gICAgfTtcblxuICAgIC8vIGdlbmVyYXRlIG5ldyBwb2ludHNcbiAgICBlZGdlLnBvaW50cyA9IFtzdGFydGluZ1BvaW50LCBlbmRpbmdQb2ludF07XG4gICAgcmV0dXJuIGdyYXBoO1xuICB9XG5cbiAgY3JlYXRlRGFncmVHcmFwaChncmFwaDogR3JhcGgpOiBhbnkge1xuICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0U2V0dGluZ3MsIHRoaXMuc2V0dGluZ3MpO1xuICAgIHRoaXMuZGFncmVHcmFwaCA9IG5ldyBkYWdyZS5ncmFwaGxpYi5HcmFwaCh7Y29tcG91bmQ6IHNldHRpbmdzLmNvbXBvdW5kLCBtdWx0aWdyYXBoOiBzZXR0aW5ncy5tdWx0aWdyYXBofSk7XG4gICAgXG4gICAgdGhpcy5kYWdyZUdyYXBoLnNldEdyYXBoKHtcbiAgICAgIHJhbmtkaXI6IHNldHRpbmdzLm9yaWVudGF0aW9uLFxuICAgICAgbWFyZ2lueDogc2V0dGluZ3MubWFyZ2luWCxcbiAgICAgIG1hcmdpbnk6IHNldHRpbmdzLm1hcmdpblksXG4gICAgICBlZGdlc2VwOiBzZXR0aW5ncy5lZGdlUGFkZGluZyxcbiAgICAgIHJhbmtzZXA6IHNldHRpbmdzLnJhbmtQYWRkaW5nLFxuICAgICAgbm9kZXNlcDogc2V0dGluZ3Mubm9kZVBhZGRpbmcsXG4gICAgICBhbGlnbjogc2V0dGluZ3MuYWxpZ24sXG4gICAgICBhY3ljbGljZXI6IHNldHRpbmdzLmFjeWNsaWNlcixcbiAgICAgIHJhbmtlcjogc2V0dGluZ3MucmFua2VyLFxuICAgICAgbXVsdGlncmFwaDogc2V0dGluZ3MubXVsdGlncmFwaCxcbiAgICAgIGNvbXBvdW5kOiBzZXR0aW5ncy5jb21wb3VuZFxuICAgIH0pO1xuXG4gICAgLy8gRGVmYXVsdCB0byBhc3NpZ25pbmcgYSBuZXcgb2JqZWN0IGFzIGEgbGFiZWwgZm9yIGVhY2ggbmV3IGVkZ2UuXG4gICAgdGhpcy5kYWdyZUdyYXBoLnNldERlZmF1bHRFZGdlTGFiZWwoKCkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLyogZW1wdHkgKi9cbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICB0aGlzLmRhZ3JlTm9kZXMgPSBncmFwaC5ub2Rlcy5tYXAobiA9PiB7XG4gICAgICBjb25zdCBub2RlOiBhbnkgPSBPYmplY3QuYXNzaWduKHt9LCBuKTtcbiAgICAgIG5vZGUud2lkdGggPSBuLmRpbWVuc2lvbi53aWR0aDtcbiAgICAgIG5vZGUuaGVpZ2h0ID0gbi5kaW1lbnNpb24uaGVpZ2h0O1xuICAgICAgbm9kZS54ID0gbi5wb3NpdGlvbi54O1xuICAgICAgbm9kZS55ID0gbi5wb3NpdGlvbi55O1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSk7XG5cbiAgICB0aGlzLmRhZ3JlRWRnZXMgPSBncmFwaC5lZGdlcy5tYXAobCA9PiB7XG4gICAgICBjb25zdCBuZXdMaW5rOiBhbnkgPSBPYmplY3QuYXNzaWduKHt9LCBsKTtcbiAgICAgIGlmICghbmV3TGluay5pZCkge1xuICAgICAgICBuZXdMaW5rLmlkID0gaWQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdMaW5rO1xuICAgIH0pO1xuXG4gICAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMuZGFncmVOb2Rlcykge1xuICAgICAgaWYgKCFub2RlLndpZHRoKSB7XG4gICAgICAgIG5vZGUud2lkdGggPSAyMDtcbiAgICAgIH1cbiAgICAgIGlmICghbm9kZS5oZWlnaHQpIHtcbiAgICAgICAgbm9kZS5oZWlnaHQgPSAzMDtcbiAgICAgIH1cblxuICAgICAgLy8gdXBkYXRlIGRhZ3JlXG4gICAgICB0aGlzLmRhZ3JlR3JhcGguc2V0Tm9kZShub2RlLmlkLCBub2RlKTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgZGFncmVcbiAgICBmb3IgKGNvbnN0IGVkZ2Ugb2YgdGhpcy5kYWdyZUVkZ2VzKSB7XG4gICAgICBpZiAoc2V0dGluZ3MubXVsdGlncmFwaCkge1xuICAgICAgICB0aGlzLmRhZ3JlR3JhcGguc2V0RWRnZShlZGdlLnNvdXJjZSwgZWRnZS50YXJnZXQsIGVkZ2UsIGVkZ2UuaWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kYWdyZUdyYXBoLnNldEVkZ2UoZWRnZS5zb3VyY2UsIGVkZ2UudGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5kYWdyZUdyYXBoO1xuICB9XG59XG4iXX0=