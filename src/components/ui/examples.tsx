/**
 * UI Component Examples
 * Demonstrates usage of all UI components
 * This file is for reference only and not used in production
 */

"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Textarea,
  Select,
  DatePicker,
  Alert,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Modal,
  ModalFooter,
  Progress,
  CircularProgress,
  Stepper,
  Skeleton,
  SkeletonCard,
  Tooltip,
  useToast,
} from "./index";

export function ComponentExamples() {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectValue, setSelectValue] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="space-y-12 p-8">
      <section>
        <h2 className="mb-4 text-2xl font-bold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" isLoading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Form Inputs</h2>
        <div className="max-w-md space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            helperText="We'll never share your email"
          />
          <Input
            label="Password"
            type="password"
            error="Password must be at least 8 characters"
            required
          />
          <Textarea
            label="Message"
            placeholder="Tell us what you think"
            rows={4}
          />
          <Select
            label="Country"
            options={[
              { value: "uk", label: "United Kingdom" },
              { value: "us", label: "United States" },
              { value: "ca", label: "Canada" },
            ]}
            value={selectValue}
            onChange={setSelectValue}
            placeholder="Select a country"
          />
          <DatePicker
            label="Birth Date"
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Alerts</h2>
        <div className="space-y-4">
          <Alert variant="info" title="Information">
            This is an informational alert with additional context.
          </Alert>
          <Alert variant="success" title="Success!">
            Your changes have been saved successfully.
          </Alert>
          <Alert variant="warning" title="Warning">
            This action cannot be undone. Please proceed with caution.
          </Alert>
          <Alert variant="error" title="Error" onDismiss={() => {}}>
            Something went wrong. Please try again later.
          </Alert>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge size="sm">Small</Badge>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Cards</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>A simple card with content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                This is the card content area where you can put any content.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="primary">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Outlined Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Outlined variant with bold border.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Elevated variant with shadow.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Modal</h2>
        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Example Modal"
          size="md"
        >
          <p className="mb-4 text-slate-600">
            This is a modal dialog. It can contain any content you need.
          </p>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </ModalFooter>
        </Modal>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Progress</h2>
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium">Linear Progress</h3>
            <Progress value={30} showLabel />
            <Progress value={60} variant="success" className="mt-2" />
            <Progress value={80} variant="warning" className="mt-2" />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Circular Progress</h3>
            <div className="flex gap-4">
              <CircularProgress value={25} />
              <CircularProgress value={50} variant="success" />
              <CircularProgress value={75} variant="warning" />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Stepper</h3>
            <Stepper
              steps={["Details", "Payment", "Confirmation"]}
              currentStep={currentStep}
            />
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => setCurrentStep(Math.min(2, currentStep + 1))}
                disabled={currentStep === 2}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Skeleton Loaders</h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Text Skeleton</h3>
            <Skeleton count={3} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Card Skeleton</h3>
            <SkeletonCard hasImage />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Tooltips</h2>
        <div className="flex gap-4">
          <Tooltip content="Top tooltip" position="top">
            <Button>Hover me (top)</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" position="bottom">
            <Button>Hover me (bottom)</Button>
          </Tooltip>
          <Tooltip content="This is a longer tooltip with more information">
            <Button>Long tooltip</Button>
          </Tooltip>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Toast Notifications</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => showToast("Success message", "success")}>
            Success Toast
          </Button>
          <Button onClick={() => showToast("Error message", "error")}>
            Error Toast
          </Button>
          <Button onClick={() => showToast("Warning message", "warning")}>
            Warning Toast
          </Button>
          <Button onClick={() => showToast("Info message", "info")}>
            Info Toast
          </Button>
        </div>
      </section>
    </div>
  );
}
