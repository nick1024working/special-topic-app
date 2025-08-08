import { IdNameDto } from "./id-name.dto";

export interface AllUsedBookLookupListsDto {
    bookBindings: IdNameDto[];
    bookConditionRatings: IdNameDto[];
    contentRatings: IdNameDto[];
    counties: IdNameDto[];
    languages: IdNameDto[];
}
