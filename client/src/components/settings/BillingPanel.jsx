"use client";

import { CreditCard, Receipt } from "lucide-react";
import Panel from "./Panel";
import { Button } from "@/components/ui";

export default function BillingPanel({ group }) {
  return (
    <>
      <Panel title="Payment methods">
        <div className="flex items-center gap-4 bg-sand-100 rounded-inner p-4 border border-divider">
          <div className="w-12 h-8 bg-surface rounded shadow-sm border border-divider flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-ink" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-ink text-[15px]">Visa ending in 4242</p>
            <p className="text-[13px] text-sand-600">Expires 12/28</p>
          </div>
          <Button variant="secondary" size="sm">Update</Button>
        </div>
      </Panel>

      <Panel title="Billing history">
        <div className="divide-y divide-divider border border-divider rounded-inner overflow-hidden">
          {[
            { date: "Sep 1, 2026", amount: "$19.00", status: "Paid" },
            { date: "Aug 1, 2026", amount: "$19.00", status: "Paid" },
            { date: "Jul 1, 2026", amount: "$19.00", status: "Paid" },
          ].map((inv, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-surface">
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4 text-sand-500" />
                <span className="text-[14px] text-ink font-medium">{inv.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[14px] text-sand-600">{inv.amount}</span>
                <span className="text-[12px] bg-sand-200 text-ink px-2 py-0.5 rounded-full font-medium">{inv.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
