'use client';

import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Label } from '@/components/ui';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Category } from '@/types';

const categorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    color: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Invalid color format'),
    icon: z.string().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

const colorPresets = [
    '#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#A855F7',
];

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CategoryForm>({
        resolver: zodResolver(categorySchema),
        defaultValues: { color: '#3B82F6' },
    });

    const selectedColor = watch('color');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/categories');
            setCategories(response.data.data.categories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openAddModal = () => {
        setEditingCategory(null);
        reset({ name: '', color: '#3B82F6', icon: 'tag' });
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        if (category.isDefault) {
            alert('Default categories cannot be edited');
            return;
        }
        setEditingCategory(category);
        reset({ name: category.name, color: category.color, icon: category.icon });
        setIsModalOpen(true);
    };

    const onSubmit = async (data: CategoryForm) => {
        try {
            setSubmitting(true);
            if (editingCategory) {
                await api.put(`/categories/${editingCategory._id}`, data);
            } else {
                await api.post('/categories', data);
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            console.error('Failed to save category:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const deleteCategory = async (id: string, isDefault: boolean) => {
        if (isDefault) {
            alert('Default categories cannot be deleted');
            return;
        }
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    const defaultCategories = categories.filter(c => c.isDefault);
    const customCategories = categories.filter(c => !c.isDefault);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Organize your expenses with custom categories</p>
                </div>
                <Button onClick={openAddModal} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {/* Custom Categories */}
            <Card>
                <CardHeader>
                    <CardTitle>My Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                            ))}
                        </div>
                    ) : customCategories.length === 0 ? (
                        <div className="text-center py-8">
                            <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">No custom categories yet</p>
                            <Button onClick={openAddModal} variant="outline" className="mt-4">
                                Create your first category
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {customCategories.map((category) => (
                                <div
                                    key={category._id}
                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
                                        <span className="font-medium">{category.name}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEditModal(category)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteCategory(category._id, category.isDefault)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Default Categories */}
            <Card>
                <CardHeader>
                    <CardTitle>Default Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {defaultCategories.map((category) => (
                            <div
                                key={category._id}
                                className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4"
                            >
                                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
                                <span className="font-medium">{category.name}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input id="name" placeholder="e.g., Subscriptions" {...register('name')} error={errors.name?.message} />
                        </div>

                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {colorPresets.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setValue('color', color)}
                                        className={`h-8 w-8 rounded-full transition-transform ${selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <Input id="color" type="text" placeholder="#3B82F6" {...register('color')} className="mt-2" error={errors.color?.message} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" loading={submitting}>{editingCategory ? 'Save' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
