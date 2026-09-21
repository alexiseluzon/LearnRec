export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  ResourceList: undefined;
  ResourceDetail: { resourceId: string };
  Recommendations: undefined;
  AddResource: undefined;
};