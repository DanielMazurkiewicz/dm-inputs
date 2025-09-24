// Based on the WebXR Device API specification.
// This is a minimal set of types to make the code compile without needing `@types/webxr`.

type XRReferenceSpaceType =
  | 'viewer'
  | 'local'
  | 'local-floor'
  | 'bounded-floor'
  | 'unbounded';

interface XRSpace extends EventTarget {}

interface XRRigidTransform {
    readonly position: DOMPointReadOnly;
    readonly orientation: DOMPointReadOnly;
    readonly matrix: Float32Array;
    readonly inverse: XRRigidTransform;
}

interface XRReferenceSpace extends XRSpace {
    getOffsetReferenceSpace(originOffset: XRRigidTransform): XRReferenceSpace;
}

interface XRPose {
    readonly transform: XRRigidTransform;
    readonly emulatedPosition: boolean;
}

interface XRView {
    readonly eye: 'left' | 'right' | 'none';
    readonly projectionMatrix: Float32Array;
    readonly transform: XRRigidTransform;
}

interface XRViewerPose extends XRPose {
    readonly views: readonly XRView[];
}

interface XRSessionEvent extends Event {
    readonly session: XRSession;
}

interface XRSession extends EventTarget {
    requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
    readonly inputSources: XRInputSourceArray;
    renderState: XRRenderState;
    requestAnimationFrame(callback: XRFrameRequestCallback): number;
    cancelAnimationFrame(handle: number): void;
    end(): Promise<void>;

    addEventListener(type: 'end', listener: (event: XRSessionEvent) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: 'end', listener: (event: XRSessionEvent) => any, options?: boolean | EventListenerOptions): void;
}

interface XRRenderState {
    readonly depthNear: number;
    readonly depthFar: number;
    readonly inlineVerticalFieldOfView?: number;
    readonly baseLayer?: XRWebGLLayer;
}

interface XRWebGLLayer {
    readonly framebuffer: WebGLFramebuffer | null;
}

type XRHandedness = 'none' | 'left' | 'right';
type XRTargetRayMode = 'gaze' | 'tracked-pointer' | 'screen';

interface XRInputSource {
    readonly handedness: XRHandedness;
    readonly targetRayMode: XRTargetRayMode;
    readonly targetRaySpace: XRSpace;
    readonly gripSpace?: XRSpace;
    readonly profiles: readonly string[];
    readonly gamepad?: Gamepad;
}

interface XRInputSourceArray extends Array<XRInputSource> {
    [Symbol.iterator](): IterableIterator<XRInputSource>;
}

interface XRFrame {
    readonly session: XRSession;
    getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | undefined;
    getPose(space: XRSpace, baseSpace: XRReferenceSpace): XRPose | undefined;
}

type XRFrameRequestCallback = (time: DOMHighResTimeStamp, frame: XRFrame) => void;

interface XRSystem extends EventTarget {
    isSessionSupported(mode: 'immersive-vr' | 'inline'): Promise<boolean>;
    requestSession(mode: 'immersive-vr' | 'inline'): Promise<XRSession>;
}

interface Navigator {
    readonly xr?: XRSystem;
}