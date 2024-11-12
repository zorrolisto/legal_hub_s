import { IPagination } from "~/types";

export const defaultPagination = { limit: 10, offset: 0, total: 0, page: 1 };


export const goToNextPage = (pagination: IPagination, setPagination: any) => {
    const newOffset = pagination.offset + pagination.limit;
    if((pagination.page + 1) * pagination.limit - pagination.total < pagination.limit){
        pagination = { ...pagination, offset: newOffset, page: pagination.page + 1 };
        setPagination(pagination);
    }
};
export const goToPreviousPage = (pagination: IPagination, setPagination: any) => {
    const newOffset = pagination.offset - pagination.limit;
    if (newOffset >= 0) {
        pagination = { ...pagination, offset: newOffset, page: pagination.page - 1 };
        setPagination(pagination);
    }
};