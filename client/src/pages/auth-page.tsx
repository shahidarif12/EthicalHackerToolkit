import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { insertUserSchema } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Lock } from "lucide-react";

// Registration form schema
const registrationSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { loginMutation, registerMutation, user } = useAuth();
  const [location, navigate] = useLocation();

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Registration form
  const registrationForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      role: "user",
    },
  });

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle registration submit
  function onRegisterSubmit(values: RegistrationFormValues) {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData);
  }

  // Handle login submit
  function onLoginSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-6xl flex flex-col md:flex-row">
        {/* Left column - Auth forms */}
        <div className="md:w-1/2 p-6 flex items-center justify-center">
          <Tabs defaultValue="login" className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Lock className="mr-2 h-4 w-4" />
                        )}
                        Login
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>
                    Register to use the security testing platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registrationForm}>
                    <form
                      onSubmit={registrationForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registrationForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Choose a secure password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Shield className="mr-2 h-4 w-4" />
                        )}
                        Register
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Hero/About */}
        <div className="md:w-1/2 p-6 bg-primary text-primary-foreground flex items-center">
          <div className="max-w-lg mx-auto">
            <div className="mb-6 flex items-center gap-2">
              <Shield className="h-10 w-10" />
              <h1 className="text-3xl font-bold">SecureTest Platform</h1>
            </div>
            <h2 className="text-xl font-semibold mb-4">
              Advanced Security Testing & Education
            </h2>
            <p className="mb-6">
              A comprehensive platform for ethical hacking and security testing with
              intuitive tools for reconnaissance, vulnerability scanning, and web
              automation. Perfect for security professionals and those learning about
              cybersecurity.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <div className="bg-primary-foreground/20 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v15a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 15h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Reconnaissance Tools</h3>
                  <p className="text-sm text-primary-foreground/70">
                    DNS Lookup, WHOIS, Port Scanning & more
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-primary-foreground/20 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7H2Z" />
                    <path d="M6 11c1.5 0 3 .5 3 2-2 0-3 0-3-2Z" />
                    <path d="M18 11c-1.5 0-3 .5-3 2 2 0 3 0 3-2Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Vulnerability Scanning</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Identify security weaknesses and risks
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-primary-foreground/20 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="18" height="11" x="3" y="3" rx="2" />
                    <circle cx="12" cy="17" r="1" />
                    <path d="M12 18v3" />
                    <path d="M8 12h8" />
                    <path d="M10 16 8 12" />
                    <path d="m14 16 2-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Web Automation</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Form testing and basic scraping tools
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-primary-foreground/20 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Educational Resources</h3>
                  <p className="text-sm text-primary-foreground/70">
                    Tutorials and documentation to learn
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
