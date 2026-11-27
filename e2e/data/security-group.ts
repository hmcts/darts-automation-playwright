export interface SecurityGroupDetails {
  name: string;
  role: string;
}

// Existing reference group used by the Cucumber Admin user-assignment scenario.
export const approverGroup: SecurityGroupDetails = {
  name: 'Swansea_APPROVER',
  role: 'Approver',
};
