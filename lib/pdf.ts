export function printInvoice(inv: any) {
  const items = inv.items ?? [];
  const rows = items.map((i: any) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${i.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;">$${Number(i.unitPrice).toLocaleString("es-AR")}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;">$${Number(i.totalPrice ?? i.quantity * i.unitPrice).toLocaleString("es-AR")}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>Factura ${inv.number ?? ""}</title>
    <style>body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:40px;}
    h1{font-family:Georgia,serif;font-size:22px;margin:0 0 4px;}
    table{width:100%;border-collapse:collapse;margin-top:20px;}
    th{background:#0b1d35;color:white;padding:10px 12px;text-align:left;font-size:13px;}
    @media print{button{display:none!important;}}</style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #0b1d35;">
      <div>
        <h1>Historia Clínica</h1>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">${inv.institution ?? "Institución"}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:20px;font-weight:700;color:#0b1d35;">FACTURA</div>
        <div style="font-size:14px;font-weight:600;margin-top:2px;">#${inv.number ?? "—"}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">${inv.date ?? new Date().toLocaleDateString("es-AR")}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
      <div>
        <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Paciente</div>
        <div style="font-size:14px;font-weight:600;">${inv.patient ?? "—"}</div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Obra Social</div>
        <div style="font-size:14px;font-weight:600;">${inv.obra ?? "Particular"}</div>
      </div>
    </div>
    <table>
      <thead><tr>
        <th>Descripción</th><th style="text-align:center;">Cant.</th>
        <th style="text-align:right;">P. Unit.</th><th style="text-align:right;">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:20px;text-align:right;">
      <div style="font-size:18px;font-weight:700;color:#0b1d35;">
        Total: $${Number(inv.total).toLocaleString("es-AR")}
      </div>
    </div>
    ${inv.notes ? `<div style="margin-top:20px;padding:12px;background:#f8fafc;border-radius:6px;font-size:12px;color:#475569;"><strong>Notas:</strong> ${inv.notes}</div>` : ""}
    <button onclick="window.print()" style="margin-top:28px;padding:10px 24px;background:#0b1d35;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
      Imprimir / Guardar PDF
    </button>
  </body></html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export function printMedicalRecord(record: any, patient: any) {
  const vitals = [
    record.vitalsBpSystolic ? `TA: ${record.vitalsBpSystolic}/${record.vitalsBpDiastolic} mmHg` : null,
    record.vitalsHrBpm ? `FC: ${record.vitalsHrBpm} bpm` : null,
    record.vitalsTempC ? `Temp: ${record.vitalsTempC}°C` : null,
    record.vitalsWeightKg ? `Peso: ${record.vitalsWeightKg} kg` : null,
    record.vitalsHeightCm ? `Talla: ${record.vitalsHeightCm} cm` : null,
  ].filter(Boolean).join("  ·  ");

  const section = (label: string, content: string) => content ? `
    <div style="margin-bottom:16px;">
      <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${label}</div>
      <div style="font-size:13px;line-height:1.6;color:#1e293b;padding:10px 14px;background:#f8fafc;border-radius:6px;border-left:3px solid #0b1d35;">${content}</div>
    </div>` : "";

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>Historia Clínica — ${patient?.firstName ?? ""} ${patient?.lastName ?? ""}</title>
    <style>body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:40px;max-width:800px;}
    h1{font-family:Georgia,serif;font-size:22px;margin:0 0 4px;}
    @media print{button{display:none!important;}}</style></head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #0b1d35;">
      <div>
        <h1>Historia Clínica Electrónica</h1>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">${record.institution ?? "Institución médica"}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:13px;color:#64748b;">${record.createdAt ? new Date(record.createdAt).toLocaleDateString("es-AR", { day:"2-digit", month:"long", year:"numeric" }) : ""}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">Tipo: ${record.entryType ?? "CONSULTA"}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;padding:16px;background:#f8fafc;border-radius:8px;">
      <div>
        <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Paciente</div>
        <div style="font-size:15px;font-weight:700;">${patient?.lastName ?? ""}, ${patient?.firstName ?? ""}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">DNI: ${patient?.dni ?? "—"}</div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Médico autor</div>
        <div style="font-size:14px;font-weight:600;">${record.authorName ?? "—"}</div>
        ${record.diagnosisCie10 ? `<div style="font-size:12px;color:#64748b;margin-top:2px;">CIE-10: ${record.diagnosisCie10}</div>` : ""}
      </div>
    </div>
    ${vitals ? `<div style="margin-bottom:16px;padding:10px 14px;background:#eff6ff;border-radius:6px;font-size:12px;color:#1e40af;font-weight:500;">${vitals}</div>` : ""}
    ${section("Motivo / Subjetivo", record.subjective)}
    ${section("Examen físico / Objetivo", record.objective)}
    ${section("Diagnóstico", record.diagnosisFreeText || record.assessment)}
    ${section("Plan / Tratamiento", record.plan || record.treatment)}
    <button onclick="window.print()" style="margin-top:28px;padding:10px 24px;background:#0b1d35;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
      Imprimir / Guardar PDF
    </button>
  </body></html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}
