"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your application preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Company Information</CardTitle>
          <CardDescription>Details used in contract headers and footprints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="Your shipping company" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyReg">Registration Number</Label>
              <Input id="companyReg" placeholder="Company registration" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Input id="companyAddress" placeholder="Company address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyCountry">Country</Label>
              <Input id="companyCountry" placeholder="Country" />
            </div>
          </div>
          <Button>Save Company Info</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Integration</CardTitle>
          <CardDescription>Configure Databricks/SAC connection for contract synchronization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dbHost">Databricks Host</Label>
              <Input id="dbHost" placeholder="your-workspace.databricks.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dbWarehouse">SQL Warehouse ID</Label>
              <Input id="dbWarehouse" placeholder="Warehouse ID" />
            </div>
          </div>
          <Button variant="outline">Test Connection</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Theme preferences are controlled via the moon/sun icon in the header.</p>
        </CardContent>
      </Card>
    </div>
  );
}
