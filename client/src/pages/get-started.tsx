import { Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GetStarted() {
  const email = "connect@forgeash.in";
  const whatsapp = "+91 63691 26439";
  const whatsappLink = "https://wa.me/916369126439";
  const mailto = `mailto:${email}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-roboto-slab font-bold text-gray-900 mb-3">
            Get Pricing & a Live Demo
          </h1>
          <p className="text-lg text-gray-600">
            We're currently onboarding customers by invitation. Please contact us to
            receive pricing and schedule a personalized walkthrough.
          </p>
        </div>

        <Card className="shadow-material-2">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary-700 mt-1" />
                <div>
                  <div className="text-sm uppercase tracking-wide text-gray-500">Email</div>
                  <a href={mailto} className="text-lg text-primary-700 underline">
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-secondary-700 mt-1" />
                <div>
                  <div className="text-sm uppercase tracking-wide text-gray-500">WhatsApp</div>
                  <a href={whatsappLink} target="_blank" rel="noreferrer" className="text-lg text-secondary-700 underline">
                    {whatsapp}
                  </a>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button asChild className="bg-primary-700 hover:bg-primary-800 text-white">
                  <a href={mailto}>Email Us</a>
                </Button>
                <Button asChild variant="secondary" className="bg-secondary-700 hover:bg-secondary-800 text-white">
                  <a href={whatsappLink} target="_blank" rel="noreferrer">Message on WhatsApp</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
