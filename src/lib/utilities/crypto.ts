import { DeviceUUID } from "device-uuid";

export const getDeviceID = (): string => {
    return new DeviceUUID().get()
}