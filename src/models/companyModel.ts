import {model,models,type InferSchemaType, Schema} from "mongoose";


const companyProfileSchema = new Schema({
  manufacturer_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip: String,
  },
  taxId: {
    type: String,
  },
}, { timestamps: true });

const CompanyProfile = models.CompanyProfile || model("CompanyProfile", companyProfileSchema);
export default CompanyProfile;
