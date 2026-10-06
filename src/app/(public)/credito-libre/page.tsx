"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronRight, CheckCircle2, AlertCircle, FileText, Upload, Image as ImageIcon, X } from "lucide-react";
import { useUI } from "@/components/UIProvider";

const CLOUDINARY_CLOUD_NAME = "ofcfneae";
const CLOUDINARY_UPLOAD_PRESET = "autos_preset";

function SolicitudFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useUI();
  
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  
  const [formData, setFormData] = useState({
    // Step 1: Condiciones Libre
    range: "",
    downPayment: "",
    term: "",

    // Step 2: Personal
    firstName: "",
    secondName: "",
    lastName: "",
    secondLastName: "",
    documentType: "C.C.",
    documentNumber: "",
    
    // Step 3: Contact
    address: "",
    city: "",
    mobile: "",
    email: "",
    housingType: "Propia",
    
    // Step 4: Laboral
    occupationType: "Empleado",
    companyName: "",
    salary: "",
    expenses: "",
    
    // Step 5: Referencias
    refName: "",
    refMobile: "",
    refRelation: "",
  });

  const [idImage, setIdImage] = useState<File | null>(null);
  const [idImagePreview, setIdImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdImage(file);
      setIdImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setIdImage(null);
    setIdImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadToCloudinary = async (): Promise<string | null> => {
    if (!idImage) return null;
    const data = new FormData();
    data.append("file", idImage);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      return result.secure_url || null;
    } catch (err) {
      console.error("Error uploading ID image:", err);
      return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitApplication = async () => {
    if (!formData.range || !formData.downPayment || !formData.term) {
      toast("Por favor completa las condiciones de tu crédito", "error");
      return;
    }

    const [rangoMin, rangoMax] = formData.range.split('-');

    if (!idImage) {
      toast("Por favor adjunta una foto de tu documento de identidad", "error");
      return;
    }

    setIsUploading(true);
    toast("Subiendo documento y procesando...");
    
    const uploadedUrl = await uploadToCloudinary();
    
    if (!uploadedUrl) {
      setIsUploading(false);
      toast("Error al subir el documento. Intenta nuevamente.", "error");
      return;
    }

    try {
      const res = await fetch("/api/financing-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoSolicitud: "libre",
          rangoMin,
          rangoMax: rangoMax ? rangoMax : null,
          downPayment: formData.downPayment,
          term: formData.term,
          idDocumentUrl: uploadedUrl,
          formData
        }),
      });

      if (res.ok) {
        toast("Solicitud enviada exitosamente", "success");
        router.push("/vehiculos"); 
      } else {
        const errorData = await res.json();
        toast(errorData.message || "Error al enviar la solicitud", "error");
      }
    } catch (error) {
      toast("Error de conexión", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff", marginBottom: "1rem" };
  const labelStyle = { display: "block", color: "#aaa", marginBottom: "0.5rem", fontSize: "0.9rem" };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "2rem", color: "#cda434", marginBottom: "0.5rem", textAlign: "center" }}>Solicitud de Crédito</h1>
      <p style={{ color: "#aaa", textAlign: "center", marginBottom: "2rem" }}>Completa el formato universal para analizar tu perfil</p>
      
      {/* Progress Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "2px", background: "rgba(255,255,255,0.1)", zIndex: -1 }}></div>
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} style={{ 
            width: "30px", height: "30px", borderRadius: "50%", 
            background: step >= s ? "#cda434" : "#222", 
            border: `2px solid ${step >= s ? "#cda434" : "#444"}`,
            color: step >= s ? "#000" : "#aaa",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
          }}>
            {s}
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "2rem" }}>
        {step === 1 && (
          <div>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>Condiciones de Crédito</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
              <div>
                <label style={labelStyle}>Rango de vehículo de interés</label>
                <select style={inputStyle} name="range" value={formData.range} onChange={handleChange}>
                  <option value="">Selecciona un rango...</option>
                  <option value="20000000-50000000">$20.000.000 a $50.000.000</option>
                  <option value="51000000-80000000">$51.000.000 a $80.000.000</option>
                  <option value="81000000-100000000">$81.000.000 a $100.000.000</option>
                  <option value="101000000-">$101.000.000 en adelante</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Cuota inicial disponible ($)</label>
                <input style={inputStyle} name="downPayment" type="number" placeholder="Ej: 15000000" value={formData.downPayment} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>Plazo (meses)</label>
                <select style={inputStyle} name="term" value={formData.term} onChange={handleChange}>
                  <option value="">Selecciona el plazo...</option>
                  <option value="60">60 meses</option>
                  <option value="72">72 meses</option>
                  <option value="90">90 meses</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>Información del Solicitante</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div><label style={labelStyle}>Primer Nombre</label><input style={inputStyle} name="firstName" value={formData.firstName} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Segundo Nombre</label><input style={inputStyle} name="secondName" value={formData.secondName} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Primer Apellido</label><input style={inputStyle} name="lastName" value={formData.lastName} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Segundo Apellido</label><input style={inputStyle} name="secondLastName" value={formData.secondLastName} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Tipo Documento</label><select style={inputStyle} name="documentType" value={formData.documentType} onChange={handleChange}><option>C.C.</option><option>C.E.</option><option>Pasaporte</option></select></div>
              <div><label style={labelStyle}>No. Identificación</label><input style={inputStyle} name="documentNumber" value={formData.documentNumber} onChange={handleChange} /></div>
            </div>

            <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.3)", padding: "1.5rem", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.2)" }}>
              <label style={{...labelStyle, marginBottom: "1rem", color: "#cda434", fontWeight: "bold"}}>Foto del Documento de Identidad *</label>
              
              {!idImagePreview ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon size={48} color="#aaa" style={{ marginBottom: "1rem" }} />
                  <p style={{ color: "#fff", marginBottom: "0.5rem" }}>Haz clic para subir la foto</p>
                  <p style={{ color: "#888", fontSize: "0.8rem", textAlign: "center" }}>Sube una foto clara por lado y lado o un solo archivo combinado (JPG, PNG)</p>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: "none" }} />
                </div>
              ) : (
                <div style={{ position: "relative", width: "100%", maxWidth: "300px", margin: "0 auto", borderRadius: "8px", overflow: "hidden", border: "2px solid #cda434" }}>
                  <img src={idImagePreview} alt="Documento" style={{ width: "100%", height: "auto", display: "block" }} />
                  <button type="button" onClick={removeImage} style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>Datos de Contacto y Vivienda</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Dirección</label><input style={inputStyle} name="address" value={formData.address} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Ciudad</label><input style={inputStyle} name="city" value={formData.city} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Celular</label><input style={inputStyle} name="mobile" value={formData.mobile} onChange={handleChange} /></div>
              <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Correo Electrónico (E-mail)</label><input style={inputStyle} name="email" value={formData.email} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Tipo de Vivienda</label><select style={inputStyle} name="housingType" value={formData.housingType} onChange={handleChange}><option>Familiar</option><option>Propia</option><option>Arrendada</option></select></div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>Información Laboral</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div><label style={labelStyle}>Ocupación</label><select style={inputStyle} name="occupationType" value={formData.occupationType} onChange={handleChange}><option>Empleado</option><option>Independiente</option><option>Pensionado</option></select></div>
              <div><label style={labelStyle}>Empresa</label><input style={inputStyle} name="companyName" value={formData.companyName} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Ingresos Mensuales</label><input style={inputStyle} name="salary" placeholder="$" value={formData.salary} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Egresos Mensuales</label><input style={inputStyle} name="expenses" placeholder="$" value={formData.expenses} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={{ color: "#fff", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>Referencias y Confirmación</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Nombre Referencia Personal</label><input style={inputStyle} name="refName" value={formData.refName} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Celular Referencia</label><input style={inputStyle} name="refMobile" value={formData.refMobile} onChange={handleChange} /></div>
              <div><label style={labelStyle}>Parentesco</label><input style={inputStyle} name="refRelation" value={formData.refRelation} onChange={handleChange} /></div>
            </div>

            <div style={{ background: "rgba(205,164,52,0.1)", border: "1px solid rgba(205,164,52,0.3)", padding: "1.5rem", borderRadius: "8px", marginTop: "2rem" }}>
              <h3 style={{ color: "#cda434", marginBottom: "1rem" }}>Resumen del Crédito Libre</h3>
              <p style={{ color: "#fff", marginBottom: "0.5rem" }}><strong>Rango Deseado:</strong> {formData.range || 'No seleccionado'}</p>
              <p style={{ color: "#fff", marginBottom: "0.5rem" }}><strong>Plazo Seleccionado:</strong> {formData.term} meses</p>
              <p style={{ color: "#aaa", fontSize: "0.9rem", marginTop: "1rem" }}>Al enviar esta solicitud autorizas la consulta en centrales de riesgo y aceptas los términos y condiciones.</p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
          {step > 1 ? (
            <button onClick={prevStep} style={{ padding: "0.8rem 1.5rem", background: "transparent", border: "1px solid #aaa", color: "#fff", borderRadius: "8px", cursor: "pointer" }}>Anterior</button>
          ) : <div></div>}
          
          {step < totalSteps ? (
            <button disabled={isUploading} onClick={nextStep} style={{ padding: "0.8rem 2rem", background: "#cda434", border: "none", color: "#000", fontWeight: "bold", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", opacity: isUploading ? 0.7 : 1 }}>Siguiente <ChevronRight size={18} /></button>
          ) : (
            <button disabled={isUploading} onClick={submitApplication} style={{ padding: "0.8rem 2rem", background: "#34d399", border: "none", color: "#000", fontWeight: "bold", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", opacity: isUploading ? 0.7 : 1 }}>
              {isUploading ? "Subiendo..." : <><CheckCircle2 size={18} /> Enviar Solicitud</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SolicitudCreditoPage() {
  return (
    <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center", color: "#aaa" }}>Cargando formulario...</div>}>
      <SolicitudFormContent />
    </Suspense>
  );
}
