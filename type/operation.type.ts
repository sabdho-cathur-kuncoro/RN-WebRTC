export type gpsDevice = {
  device_id: string;
  latlon: string;
};

export type gpsGroup = Promise<
  | {
      data: any;
      startingPosition: any;
    }
  | undefined
>;
