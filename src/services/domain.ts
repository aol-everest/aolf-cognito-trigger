// domainUtil.ts

// Define the types for organization and stage
type Org = 'AOL' | 'IAHV' | 'HB';
type Stage = 'dev' | 'qa' | 'prod';

// Mapping of domain URLs based on the organization and stage
const domains: Record<Stage, Record<Org, string>> = {
  dev: {
    AOL: 'https://aolf-web-dev.herokuapp.com',
    IAHV: 'https://aolf-iahv-dev.herokuapp.com',
    HB: 'https://aolf-hb-web-dev.herokuapp.com',
  },
  qa: {
    AOL: 'https://qa.members.us.artofliving.org',
    IAHV: 'https://aolf-iahv-qa.herokuapp.com',
    HB: 'https://aolf-hb-web-qa.herokuapp.com',
  },
  prod: {
    AOL: 'https://members.us.artofliving.org',
    IAHV: 'https://members.us.iahv.org',
    HB: 'https://members.healingbreaths.org',
  },
};

// Function to determine the organization based on client ID
export const getRequestOrg = (clientId: string): Org => {
  switch (clientId) {
    case process.env.IAHV_CLIENT_ID:
      return 'IAHV';
    case process.env.HB_CLIENT_ID:
      return 'HB';
    default:
      return 'AOL';
  }
};

// Function to get the domain based on organization and stage
export const getDomain = (clientId: string, stage: Stage = 'prod'): string => {
  const requestOrg = getRequestOrg(clientId);
  return domains[stage]?.[requestOrg] || domains.prod.AOL;
};
