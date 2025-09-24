// Based on the Generic Sensor API specification.
// This is a minimal set of types to make the code compile without needing full DOM type libraries.

declare global {
    interface SensorErrorEvent extends Event {
        readonly error: DOMException;
    }

    interface Sensor extends EventTarget {
        start(): void;
        stop(): void;
        activated: boolean;
        hasReading: boolean;
        timestamp?: number;

        onreading: (() => void) | null;
        onactivate: (() => void) | null;
        onerror: ((event: SensorErrorEvent) => void) | null;
    }

    interface SensorOptions {
        frequency?: number;
    }

    var Sensor: {
        prototype: Sensor;
        new(): Sensor;
    };

    interface MotionSensor extends Sensor {
        readonly x?: number | null;
        readonly y?: number | null;
        readonly z?: number | null;
    }

    var Accelerometer: {
        prototype: MotionSensor;
        new(options?: SensorOptions): MotionSensor;
    };

    var LinearAccelerationSensor: {
        prototype: MotionSensor;
        new(options?: SensorOptions): MotionSensor;
    };

    var Gyroscope: {
        prototype: MotionSensor;
        new(options?: SensorOptions): MotionSensor;
    };


    interface OrientationSensor extends Sensor {
        readonly quaternion?: number[] | null;
    }

    var AbsoluteOrientationSensor: {
        prototype: OrientationSensor;
        new(options?: SensorOptions): OrientationSensor;
    };

    // Add these to window so TypeScript knows they are global
    interface Window {
        Sensor: typeof Sensor;
        Accelerometer: typeof Accelerometer;
        LinearAccelerationSensor: typeof LinearAccelerationSensor;
        Gyroscope: typeof Gyroscope;
        AbsoluteOrientationSensor: typeof AbsoluteOrientationSensor;
    }
}

// Make this file a module by exporting an empty object.
export {};