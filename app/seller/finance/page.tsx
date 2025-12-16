"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { financeApi } from "@/lib/api/finance"
import { queryKeys } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, Plus, Loader2, CreditCard, Smartphone, Mail, Trash2, AlertCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Validation schema for withdrawal method
const withdrawalMethodSchema = z.object({
  method: z.enum(["BANK_ACCOUNT", "MOBILE_MONEY", "PAYPAL"]),
  accountName: z.string().min(2, "Account name must be at least 2 characters"),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankCode: z.string().optional(),
  mobileProvider: z.string().optional(),
  mobileNumber: z.string().optional(),
  paypalEmail: z.string().email("Invalid email address").optional(),
  setAsDefault: z.boolean().default(false),
}).superRefine((data, ctx) => {
  // Conditional validation based on method type
  if (data.method === "BANK_ACCOUNT") {
    if (!data.accountNumber || data.accountNumber.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Account number is required for bank account",
        path: ["accountNumber"]
      })
    }
    if (!data.bankName || data.bankName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bank name is required for bank account",
        path: ["bankName"]
      })
    }
  }
  
  if (data.method === "MOBILE_MONEY") {
    if (!data.mobileNumber || data.mobileNumber.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mobile number is required for mobile money",
        path: ["mobileNumber"]
      })
    }
    if (!data.mobileProvider || data.mobileProvider.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mobile provider is required for mobile money",
        path: ["mobileProvider"]
      })
    }
  }
  
  if (data.method === "PAYPAL") {
    if (!data.paypalEmail || data.paypalEmail.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PayPal email is required for PayPal",
        path: ["paypalEmail"]
      })
    }
  }
})

type WithdrawalMethodFormData = z.infer<typeof withdrawalMethodSchema>

export default function FinancePage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false)
  const [addMethodDialogOpen, setAddMethodDialogOpen] = useState(false)
  const [deleteMethodId, setDeleteMethodId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const { data: financeData, isLoading } = useQuery({
    queryKey: queryKeys.finance.dashboard,
    queryFn: financeApi.getDashboard,
  })

  // Form for withdrawal request
  const withdrawalForm = useForm({
    defaultValues: {
      amount: "",
      methodId: "",
    },
  })

  // Form for adding withdrawal method
  const addMethodForm = useForm({
    resolver: zodResolver(withdrawalMethodSchema),
    defaultValues: {
      method: "BANK_ACCOUNT",
      accountName: "",
      accountNumber: "",
      bankName: "",
      bankCode: "",
      mobileProvider: "",
      mobileNumber: "",
      paypalEmail: "",
      setAsDefault: false,
    },
  })

  // Watch the method type to conditionally render fields
  const selectedMethod = addMethodForm.watch("method")

  const withdrawalMutation = useMutation({
    mutationFn: (data: { amount: number; methodId: string }) => financeApi.requestWithdrawal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.dashboard })
      toast({
        title: "Withdrawal requested",
        description: "Your withdrawal request has been submitted successfully",
      })
      setWithdrawalDialogOpen(false)
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const addMethodMutation = useMutation({
    mutationFn: (data: WithdrawalMethodFormData) => financeApi.addWithdrawalMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.dashboard })
      toast({
        title: "Method added",
        description: "Withdrawal method added successfully",
      })
      addMethodForm.reset()
      setAddMethodDialogOpen(false)
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add method",
        description: error.message || "An error occurred while adding the withdrawal method",
        variant: "destructive",
      })
    },
  })

  const removeMethodMutation = useMutation({
    mutationFn: (methodId: string) => financeApi.removeWithdrawalMethod(methodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.dashboard })
      toast({
        title: "Method removed",
        description: "Withdrawal method removed successfully",
      })
      setDeleteConfirmOpen(false)
      setDeleteMethodId(null)
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove method",
        description: error.message || "An error occurred while removing the withdrawal method",
        variant: "destructive",
      })
    },
  })

  const onWithdrawalSubmit = (data: any) => {
    withdrawalMutation.mutate({
      amount: Number(data.amount),
      methodId: data.methodId,
    })
  }

  const onAddMethodSubmit = (data: WithdrawalMethodFormData) => {
    addMethodMutation.mutate(data)
  }

  const handleDeleteClick = (methodId: string) => {
    setDeleteMethodId(methodId)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (deleteMethodId) {
      removeMethodMutation.mutate(deleteMethodId)
    }
  }

  // Get method icon based on method type
  const getMethodIcon = (method: string) => {
    switch (method) {
      case "BANK_ACCOUNT":
        return <CreditCard className="h-4 w-4" />
      case "MOBILE_MONEY":
        return <Smartphone className="h-4 w-4" />
      case "PAYPAL":
        return <Mail className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  // Format method details for display
  const formatMethodDetails = (method: any) => {
  const methodType = method.method || 'UNKNOWN';
  const accountName = method.accountName || 'Account';
  
  switch (methodType) {
    case "BANK_ACCOUNT":
      const bankName = method.bankName || 'Bank';
      return `${bankName} • ${accountName}`;
    case "MOBILE_MONEY":
      return `Mobile Money • ${accountName}`;
    case "PAYPAL":
      return `PayPal • ${accountName}`;
    default:
      return `${methodType} • ${accountName}`;
  }
}
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground mt-2">Manage your earnings and withdrawals</p>
        </div>
        <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
            </DialogHeader>
            <form onSubmit={withdrawalForm.handleSubmit(onWithdrawalSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" placeholder="Enter amount" {...withdrawalForm.register("amount")} />
                <p className="text-xs text-muted-foreground">
                  Available: {formatCurrency(financeData?.finance?.availableBalance || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Withdrawal Method</Label>
                <Select onValueChange={(value) => withdrawalForm.setValue("methodId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {financeData?.withdrawalMethods?.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.method} - {method.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={withdrawalMutation.isPending}>
                {withdrawalMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Financial overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financeData?.finance?.totalEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financeData?.finance?.availableBalance || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financeData?.finance?.pendingBalance || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawn</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financeData?.finance?.withdrawnAmount || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total withdrawn</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Withdrawal Methods</CardTitle>
            <Dialog open={addMethodDialogOpen} onOpenChange={setAddMethodDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Method
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Withdrawal Method</DialogTitle>
                  <DialogDescription>
                    Add a new withdrawal method to receive your earnings
                  </DialogDescription>
                </DialogHeader>
                <Form {...addMethodForm}>
                  <form onSubmit={addMethodForm.handleSubmit(onAddMethodSubmit)} className="space-y-4">
                    {/* Method Type Selection */}
                    <FormField
                      control={addMethodForm.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Method Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BANK_ACCOUNT">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  Bank Account
                                </div>
                              </SelectItem>
                              <SelectItem value="MOBILE_MONEY">
                                <div className="flex items-center gap-2">
                                  <Smartphone className="h-4 w-4" />
                                  Mobile Money
                                </div>
                              </SelectItem>
                              <SelectItem value="PAYPAL">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  PayPal
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Account Name (Common to all methods) */}
                    <FormField
                      control={addMethodForm.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Conditional Fields based on selected method */}
                    {selectedMethod === "BANK_ACCOUNT" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={addMethodForm.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="1234567890" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addMethodForm.control}
                            name="bankName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Chase Bank" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={addMethodForm.control}
                          name="bankCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Code (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="CHASUS33" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {selectedMethod === "MOBILE_MONEY" && (
                      <>
                        <FormField
                          control={addMethodForm.control}
                          name="mobileProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Provider</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MTN">MTN</SelectItem>
                                  <SelectItem value="VODAFONE">Vodafone</SelectItem>
                                  <SelectItem value="AIRTEL">Airtel</SelectItem>
                                  <SelectItem value="TIGO">Tigo</SelectItem>
                                  <SelectItem value="ORANGE">Orange</SelectItem>
                                  <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addMethodForm.control}
                          name="mobileNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+233541234567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {selectedMethod === "PAYPAL" && (
                      <FormField
                        control={addMethodForm.control}
                        name="paypalEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PayPal Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john.doe@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Set as Default */}
                    <FormField
                      control={addMethodForm.control}
                      name="setAsDefault"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Set as Default</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              This method will be used by default for withdrawals
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAddMethodDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addMethodMutation.isPending}>
                        {addMethodMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Method"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {financeData?.withdrawalMethods && financeData.withdrawalMethods.length > 0 ? (
            <div className="space-y-2">
              {financeData.withdrawalMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getMethodIcon(method.method)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-6">
                        {method.accountName}
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatMethodDetails(method)}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={method.isVerified ? "default" : "outline"}
                          className={method.isVerified ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {method.isVerified ? "Verified" : "Pending Verification"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(method.id)}
                      disabled={removeMethodMutation.isPending || method.isDefault}
                      className={`
                        text-destructive hover:text-destructive hover:bg-destructive/10
                        ${method.isDefault ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                      title={method.isDefault ? "Cannot delete default method" : "Delete method"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No withdrawal methods added yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 bg-transparent"
                onClick={() => setAddMethodDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add your first method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Withdrawal Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this withdrawal method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You cannot remove a method if there are pending withdrawals associated with it.
            </AlertDescription>
          </Alert>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMethodMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={removeMethodMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMethodMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Method"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {financeData?.transactions && financeData.transactions.length > 0 ? (
            <div className="space-y-3">
              {financeData.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === "SALE"
                          ? "bg-green-500/10"
                          : transaction.type === "WITHDRAWAL"
                            ? "bg-blue-500/10"
                            : "bg-red-500/10"
                      }`}
                    >
                      <DollarSign
                        className={`h-5 w-5 ${
                          transaction.type === "SALE"
                            ? "text-green-500"
                            : transaction.type === "WITHDRAWAL"
                              ? "text-blue-500"
                              : "text-red-500"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">{transaction.reference}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${
                        transaction.type === "SALE"
                          ? "text-green-500"
                          : transaction.type === "WITHDRAWAL"
                            ? "text-blue-500"
                            : "text-red-500"
                      }`}
                    >
                      {transaction.type === "SALE" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(transaction.createdAt, "PPP")}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}