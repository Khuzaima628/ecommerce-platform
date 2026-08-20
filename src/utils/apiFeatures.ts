import type { Model } from "mongoose";

interface ApiQuery {
  search?: string;
  page?: string | number;
  limit?: string | number;
  sort?: string;
}

const apiFeatures = async <T>(
  model: Model<T>,
  queryString: ApiQuery,
  searchFields: string[] = ["title"],
  baseFilter: Record<string, unknown> = {},
) => {
  const searchQuery: Record<string, unknown> = { ...baseFilter };

  if (queryString.search) {
    searchQuery.$or = searchFields.map((field) => ({
      [field]: { $regex: queryString.search, $options: "i" },
    }));
  }

  const page = Number(queryString.page) || 1;
  const limit = Number(queryString.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = queryString.sort || "-createdAt";

  return model.find(searchQuery).sort(sort).skip(skip).limit(limit);
};

export default apiFeatures;
