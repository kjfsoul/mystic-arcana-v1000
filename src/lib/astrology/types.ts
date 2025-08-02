export type House = {
  degree: number;
  midpoint: number;
  ruler: string;
};
export type Planet = {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
};
export type Angle = {
  degrees: number;
  minutes: number;
  seconds: number;
};
export type CareerStrength = {
  title: string;
  description: string;
  rating: number;
};
export type CareerChallenge = {
  title: string;
  description: string;
  advice: string;
};
export type CareerPath = {
  title: string;
  description: string;
  industries: string[];
  compatibility: number;
};
export type NatalData = {
  location: {
    latitude: number;
    longitude: number;
  };
  time: Date;
  careerStrengths?: CareerStrength[];
  careerChallenges?: CareerChallenge[];
  careerPaths?: CareerPath[];
};
export type Chart = {
  houses: House[];
  planets: Planet[];
  ascendant: Angle;
};
