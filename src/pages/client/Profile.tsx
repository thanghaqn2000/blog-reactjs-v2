import { showToast } from "@/config/toast.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, Save, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/layouts/MainLayout";
import { userService } from "@/services/v1/user.service";

import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { profileFormSchema } from "@/schemas/user-validation";

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      currentPassword: "",
      newPassword: "",
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    watch,
    setError,
    getValues,
    formState: { isValid, errors },
    reset,
  } = form;

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone_number || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    setIsLoading(true);

    try {
      const updateParams = {
        user: {
          name: data.name,
          email: data.email,
          phone_number: data.phone,
          password: data.newPassword || "",
          current_password: data.currentPassword || "",
        },
      };

      const response = await userService.updateProfile(updateParams, user.id);

      if (response?.user) {
        updateUser({
          ...user,
          name: response.user.name,
          email: response.user.email,
          phone_number: response.user.phone_number,
        });

        setError("currentPassword", { message: "" });
        setError("newPassword", { message: "" });
        showToast.success("Cập nhật hồ sơ thành công");
      }
    } catch (error) {
      const errors = error.response?.data?.data?.errors;
      if (errors) {
        if (errors.phone_number) {
          setError("phone", { 
            message: errors.phone_number[0] || "Số điện thoại không hợp lệ" 
          });
        }
        if (errors.email) {
          setError("email", { 
            message: errors.email[0] || "Email không hợp lệ" 
          });
        }
        if (errors.current_password) {
          setError("currentPassword", { 
            message: errors.current_password[0] || "Mật khẩu không hợp lệ" 
          });
        }
      } else {
        showToast.error("Cập nhật hồ sơ thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-16 animate-fade-in mt-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Hồ sơ của tôi</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg" alt="Profile" />
                      <AvatarFallback>
                        <UserIcon className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="text-center">
                      <h2 className="text-xl font-semibold">{watch("name")}</h2>
                    </div>

                    <div className="w-full space-y-2 mt-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{watch("email")}</span>
                      </div>

                      {watch("phone") && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{watch("phone")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập họ tên của bạn" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập địa chỉ email của bạn" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập số điện thoại của bạn" {...field} />
                            </FormControl>
                            {user?.require_phone_number && getValues("phone") === "" && (
                              <p className="text-sm text-red-500">Hãy nhập số điện thoại</p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="border-t pt-4">
                        <h3 className="text-lg font-medium mb-4">Đổi mật khẩu</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Để đổi mật khẩu, vui lòng nhập cả mật khẩu hiện tại và mật khẩu mới
                        </p>

                        <div className="space-y-4">
                          <FormField
                            control={control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mật khẩu hiện tại</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Nhập mật khẩu hiện tại" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mật khẩu mới</FormLabel>
                                <FormControl>
                                  <Input 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Nhập mật khẩu mới" {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <CardFooter className="px-0 pt-6">
                        <Button 
                          type="submit" 
                          className="w-full md:w-auto" 
                          disabled={isLoading || !isValid || Object.keys(errors).length > 0}
                        >
                          {isLoading ? "Đang lưu..." : "Lưu thông tin"}
                          {!isLoading && <Save className="ml-2 h-4 w-4" />}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
