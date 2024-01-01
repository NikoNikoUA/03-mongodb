import decorators from "../decorators/index.js";
import model from "../models/Contact.js";
import helpers from "../helpers/index.js";

const { Contact } = model;

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  const result = await Contact.find({ owner }, "", { skip, limit }).populate(
    "owner",
    "name email"
  );
  res.json(result);
};

const getById = async (req, res) => {
  const { contactId: _id } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findOne({ _id, owner });
  if (!result) {
    throw helpers.HttpError(404, "Not found");
  }
  res.json(result);
};

const addContact = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Contact.create({ ...req.body, owner });
  res.status(201).json(result);
};

const updateContact = async (req, res) => {
  const { contactId: _id } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findOneAndUpdate({ _id, owner }, req.body, {
    new: true,
    runValitadors: true,
  });
  if (!result) {
    throw helpers.HttpError(404, "Not found");
  }
  res.json(result);
};

const updateStatusContact = async (req, res) => {
  const { contactId: _id } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findOneAndUpdate({ _id, owner }, req.body, {
    new: true,
  });
  if (!result) {
    throw helpers.HttpError(404, "Not found");
  }
  res.json(result);
};

const deleteContact = async (req, res) => {
  const { contactId: _id } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findOneAndDelete({ _id, owner });
  if (!result) {
    throw helpers.HttpError(404, "Not found");
  }
  res.status(200).json({ message: "Contact deleted" });
};

export default {
  getAll: decorators.ctrlWrapper(getAll),
  getById: decorators.ctrlWrapper(getById),
  addContact: decorators.ctrlWrapper(addContact),
  deleteContact: decorators.ctrlWrapper(deleteContact),
  updateContact: decorators.ctrlWrapper(updateContact),
  updateStatusContact: decorators.ctrlWrapper(updateStatusContact),
};
