"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import type { Product } from "@/types";
import {
  productsApi,
  type AdminProductUpsertPayload,
} from "@/lib/api/products";
import {
  modifiersApi,
  ModifierGroupWithWithOptions,
} from "@/lib/api/modifiers";
import { categoriesApi, Category } from "@/lib/api/categories";
import { useI18n } from "@/contexts/I18nContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import * as Icons from "lucide-react";

type FormValues = {
  name: string;
  description: string;
  allergens: string;
  price: string;
  status: "AVAILABLE" | "UNAVAILABLE" | "SOLD_OUT";
  categoryName: string;
  imageUrl: string;
  modifierGroupIds: string[];
  isChefRecommended: boolean;
  prepTimeMinutes: string;
};

export default function ProductFormModal({
  open,
  product,
  onClose,
}: {
  open: boolean;
  product: Product | null;
  onClose: (shouldRefresh?: boolean) => void;
}) {
  const { t } = useI18n();
  const { data: modifierGroups } = useSWR<ModifierGroupWithWithOptions[]>(
    "modifiers",
    modifiersApi.getAllGroups,
  );

  const { data: categories } = useSWR<Category[]>(
    "categories",
    categoriesApi.getAll
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      allergens: "",
      price: "",
      status: "AVAILABLE",
      categoryName: "",
      imageUrl: "",
      modifierGroupIds: [],
      isChefRecommended: false,
      prepTimeMinutes: "",
    },
  });

  /* ================= Image helpers ================= */
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const imgUrl = (u?: string | null) => {
    if (!u) return "";
    return u.startsWith("http") ? u : `${API_BASE}${u}`;
  };

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  /* ================= Reset form when open ================= */
  useEffect(() => {
    if (!open) return;

    setPendingFiles([]);

    if (!product) {
      reset({
        name: "",
        description: "",
        allergens: "",
        price: "",
        status: "AVAILABLE",
        categoryName: "",
        imageUrl: "",
        modifierGroupIds: [],
        isChefRecommended: false,
        prepTimeMinutes: "",
      });
      return;
    }

    const primaryImage = product.images?.find((i) => i.isPrimary)?.url ?? "";

    reset({
      name: product.name,
      description: product.description ?? "",
      allergens: product.allergens ?? "",
      price: String(product.price ?? ""),
      status: product.status,
      categoryName: product.category?.name ?? "",
      imageUrl: primaryImage,
      modifierGroupIds:
        product.modifierGroups?.map((pmg) => pmg.modifierGroupId) || [],
      isChefRecommended: product.isChefRecommended || false,
      prepTimeMinutes: product.prepTimeMinutes ? String(product.prepTimeMinutes) : "",
    });
  }, [open, product, reset]);

  /* ================= Submit ================= */
  const onSubmit = async (values: FormValues) => {
    const payload: AdminProductUpsertPayload = {
      name: values.name,
      description: values.description || null,
      allergens: values.allergens || null,
      price: values.price,
      status: values.status,
      categoryName: values.categoryName,
      imageUrl: values.imageUrl || null,
      isChefRecommended: values.isChefRecommended,
      prepTimeMinutes: values.prepTimeMinutes ? Number(values.prepTimeMinutes) : null,
    };

    try {
      let savedProduct: Product;

      if (product) {
        savedProduct = await productsApi.update(product.id, payload);
      } else {
        savedProduct = await productsApi.create(payload);
      }

      await modifiersApi.updateProductModifierGroups(
        savedProduct.id,
        values.modifierGroupIds,
      );

      /* ✅ Upload multiple images */
      if (pendingFiles.length > 0) {
        await productsApi.uploadImages(savedProduct.id, pendingFiles);
        setPendingFiles([]);
      }

      onClose(true);
    } catch (error: any) {
      console.error("Product form error:", error);
      alert(
        `Error: ${error.response?.data?.message ||
        error.message ||
        t('common.error') || "Failed to save product"
        }`,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose(false) : null)}>
      <DialogContent className="!max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold">{product ? (t('admin.products') + " - " + t('common.edit')) : (t('admin.products') + " - " + t('common.add'))}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* ================= LEFT COLUMN: DETAILS ================= */}
              <div className="space-y-6">

                {/* Name & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">{t('common.name')}</label>
                    <Input {...register("name", {
                      required: t('common.requiredField') || "Name is required",
                      maxLength: {
                        value: 100,
                        message: t('common.maxLength', { max: 100 })
                      }
                    })} placeholder="e.g. Beef Burger" />
                    {errors.name && (
                      <div className="text-xs text-red-600">
                        {errors.name.message}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">{t('common.price')} (VND)</label>
                    <Input
                      {...register("price", {
                        required: t('common.requiredField') || "Price is required",
                        validate: (v) => (Number(v) > 0 ? true : (t('common.invalidPrice') || "Price must be > 0")),
                      })}
                      placeholder="0"
                    />
                    {errors.price && (
                      <div className="text-xs text-red-600">
                        {errors.price.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">{t('admin.categories') || "Category"}</label>
                    <select
                      {...register("categoryName", {
                        required: t('common.requiredField') || "Category is required",
                      })}
                      className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-transparent"
                    >
                      <option value="">{t('common.selectCategory') || "Select a category"}</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryName && (
                      <div className="text-xs text-red-600">
                        {errors.categoryName.message}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">{t('common.status')}</label>
                    <select
                      {...register("status")}
                      className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-transparent"
                    >
                      <option value="AVAILABLE">{t('menu.statusAvailable') || "AVAILABLE"}</option>
                      <option value="UNAVAILABLE">{t('menu.statusUnavailable') || "UNAVAILABLE"}</option>
                      <option value="SOLD_OUT">{t('menu.statusSoldOut') || "SOLD_OUT"}</option>
                    </select>
                  </div>
                </div>

                {/* PrepTime & Chef Recommended */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">{t('common.prepTime') || "Prep Time"} (minutes)</label>
                    <Input
                      type="number"
                      {...register("prepTimeMinutes", {
                        min: { value: 0, message: "Must be >= 0" }
                      })}
                      placeholder="15"
                    />
                    {errors.prepTimeMinutes && (
                      <div className="text-xs text-red-600">
                        {errors.prepTimeMinutes.message}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pb-3">
                    <input
                      type="checkbox"
                      id="isChefRecommended"
                      {...register("isChefRecommended")}
                      className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="isChefRecommended" className="flex items-center gap-2 text-sm font-semibold select-none cursor-pointer">
                      <Icons.ChefHat className="w-4 h-4 text-orange-600" />
                      {t('menu.chefsChoice') || "Chef Recommended"}
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t('common.description')}</label>
                  <textarea
                    {...register("description", {
                      maxLength: {
                        value: 1000,
                        message: t('common.maxLength', { max: 1000 })
                      }
                    })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 min-h-[100px]"
                    placeholder="Describe the dish..."
                  />
                  {errors.description && (
                    <div className="text-xs text-red-600">
                      {errors.description.message}
                    </div>
                  )}
                </div>

                {/* Allergens */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t('common.allergens')} (comma separated)</label>
                  <Input
                    {...register("allergens")}
                    placeholder="e.g., Milk, Eggs, Nuts"
                  />
                </div>
              </div>

              {/* ================= RIGHT COLUMN: MEDIA & OPTIONS ================= */}
              <div className="space-y-6">

                {/* Images Section */}
                <div className="rounded-lg border bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Icons.Image className="w-4 h-4" />
                      {t('common.images') || "Images"}
                    </h3>
                    <label className="text-sm px-3 py-1.5 rounded-md border bg-white cursor-pointer hover:bg-gray-100 transition-colors shadow-sm font-medium">
                      {t('common.uploadImages') || "Upload images"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setPendingFiles((prev) => [...prev, ...files]);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {/* Pending upload */}
                  {pendingFiles.length > 0 && (
                    <div className="mb-4 rounded-md border border-dashed border-gray-300 p-3 bg-white">
                      <div className="text-xs font-medium mb-2 text-gray-500 uppercase tracking-wider">
                        {t('common.pendingUpload') || "Pending upload"} ({pendingFiles.length})
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {pendingFiles.map((f, idx) => (
                          <div
                            key={idx}
                            className="text-xs border rounded-full px-3 py-1 bg-blue-50 text-blue-700 flex items-center gap-2"
                          >
                            <span className="truncate max-w-[150px]">{f.name}</span>
                            <button
                              type="button"
                              className="text-blue-400 hover:text-blue-700 font-bold"
                              onClick={() =>
                                setPendingFiles((p) => p.filter((_, i) => i !== idx))
                              }
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gallery Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-h-[100px]">
                    {product?.images?.length ? (
                      product.images.map((img: any) => (
                        <div
                          key={img.id}
                          className="group relative border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-square bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl(img.url)}
                              alt="product"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Overlay Actions */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            <button
                              type="button"
                              className={`text-[10px] px-2 py-1 rounded-full font-medium ${img.isPrimary ? "bg-green-500 text-white" : "bg-white text-gray-900 hover:bg-gray-200"}`}
                              onClick={async () => {
                                if (!product?.id) return;
                                await productsApi.setPrimaryImage(product.id, img.id);
                                onClose(true);
                              }}
                            >
                              {img.isPrimary ? (t('common.primary') || "Primary") : (t('common.setPrimary') || "Set Primary")}
                            </button>
                            <button
                              type="button"
                              className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 font-medium"
                              onClick={async () => {
                                if (!product?.id) return;
                                await productsApi.deleteImage(product.id, img.id);
                                onClose(true);
                              }}
                            >
                              {t('common.delete')}
                            </button>
                          </div>
                          {/* Primary Badge (Always visible if primary) */}
                          {img.isPrimary && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm z-10 pointer-events-none">
                              ★
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full flex items-center justify-center h-full text-sm text-gray-400 italic bg-gray-100 rounded-lg border-dashed border-2 border-gray-200">
                        {t('common.noImages') || "No images yet."}
                      </div>
                    )}
                  </div>

                  {/* Image URL Fallback */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      {t('common.primaryImageUrl') || "Or use Image URL"}
                    </label>
                    <div className="flex gap-2">
                      <Input {...register("imageUrl", {
                        pattern: {
                          value: /^(https?:\/\/.+)|(^\/.*)$/,
                          message: t('common.invalidUrl') || "Invalid URL format"
                        }
                      })} placeholder="https://example.com/image.jpg" className="h-8 text-xs" />
                    </div>
                    {errors.imageUrl && (
                      <div className="text-xs text-red-600 mt-1">
                        {errors.imageUrl.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modifiers Section */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Icons.ListPlus className="w-4 h-4" />
                    {t('admin.modifiers') || "Modifier Groups"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1">
                    {modifierGroups?.map((group) => (
                      <label
                        key={group.id}
                        className="flex items-center gap-3 rounded-md border border-gray-200 p-2.5 cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors bg-white shadow-sm"
                      >
                        <input
                          type="checkbox"
                          value={group.id}
                          {...register("modifierGroupIds")}
                          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium">{group.name}</span>
                      </label>
                    ))}
                    {(!modifierGroups || modifierGroups.length === 0) && (
                      <span className="text-sm text-gray-500 col-span-2 italic p-2">
                        {t('common.noModifiers') || "No modifier groups available."}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[100px] shadow-sm">
              {isSubmitting ? (t('common.saving') || "Saving...") : (t('common.save') || "Save Product")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog >
  );
}
