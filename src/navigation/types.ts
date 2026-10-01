import type {NavigatorScreenParams} from '@react-navigation/native';

export type InspectionDraft = {
  vendorAlias: string;
  stallCode: string;
  category: string;
  phone: string;
  risk: string;
  consent: boolean;
};

export type NewInspectionStackParamList = {
  NewInspectionForm: {stallCode?: string};
  Camera: undefined;
  Review: {draft: InspectionDraft; imageUri?: string; timestamp: string};
};

export type RecordsStackParamList = {
  RecordsList: undefined;
  InspectionDetails: {recordId: string};
};

export type RootTabParamList = {
  Home: undefined;
  NewInspection: {stallCode?: string};
  Records: NavigatorScreenParams<RecordsStackParamList>;
};

export type AppRouteParamList = {
  Home: undefined;
  NewInspection: {stallCode?: string};
  Camera: undefined;
  Review: {draft: InspectionDraft; imageUri?: string; timestamp: string};
  Records: undefined;
  InspectionDetails: {recordId: string};
};
