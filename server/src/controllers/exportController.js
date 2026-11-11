import PDFDocument from 'pdfkit';
import { db } from '../config/database.js';
import { safeJsonParse } from '../utils/helpers.js';

/**
 * Generate Architectural Specification Sheet PDF
 * Uses PDFKit to produce a sleek, branded, high-contrast dark/gold PDF
 */
export async function exportSpecPdf(req, res) {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid projectId.'
      });
    }

    let project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      // Create a default project record on the fly if user clicks from studio
      const {
        title = 'AtelierAI Curated Living Studio',
        style_preset = 'Japandi & Warm Minimalism',
        diurnal_lighting = 'Morning Golden Hour',
        camera_angle = 'Isometric Cutaway Dollhouse',
        current_prompt = 'Curated minimalist living space featuring textured bouclé seating, fluted timber acoustic panels, brushed brass accents, and diffused volumetric daylight.',
        render_2d_url = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
        model_3d_url = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb',
        color_swatches = ['#F3EFE6', '#D4AF37', '#8E4A23', '#24272C'],
        materials_list = [
          'Beige Bouclé Fabric (Primary Seating)',
          'Brushed Architectural Brass (Accent Hardware)',
          'Cognac Saddle Leather (Lounge Armchair)',
          'Fluted Charcoal Acoustic Timber'
        ]
      } = req.body;

      db.prepare(`
        INSERT OR REPLACE INTO projects (
          id, user_id, title, style_preset, diurnal_lighting, camera_angle,
          current_prompt, render_2d_url, model_3d_url, color_swatches, materials_list
        ) VALUES (?, 'guest_user', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        projectId,
        title,
        style_preset,
        diurnal_lighting,
        camera_angle,
        current_prompt,
        render_2d_url,
        model_3d_url,
        JSON.stringify(color_swatches),
        JSON.stringify(materials_list)
      );

      project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    }

    const colorSwatches = safeJsonParse(project.color_swatches, ['#F3EFE6', '#D4AF37', '#8E4A23', '#24272C']);
    const pantoneReferences = ['Pantone 11-0601 TPG (Whisper White)', 'Pantone 16-0947 TPG (Antique Gold)', 'Pantone 18-1033 TPG (Andorra Russet)', 'Pantone 19-4203 TPG (Charcoal Slate)'];
    const materialsList = safeJsonParse(project.materials_list, [
      'Beige Bouclé Fabric (Primary Sectional Upholstery)',
      'Brushed Architectural Brass (Legs & Accent Trim)',
      'Cognac Saddle Leather (Ergonomic Lounge Armchair)',
      'Fluted Charcoal Acoustic Timber & White Oak'
    ]);
    const budgetReferences = [
      { item: 'Curvilinear 3-Piece Bouclé Sectional', mfg: 'B&B Italia / Custom Atelier', retail: '$4,850', estLead: '4-6 weeks' },
      { item: 'Travertine & Brushed Brass Coffee Table', mfg: 'Menu Space / GUBI Reference', retail: '$1,420', estLead: '2-3 weeks' },
      { item: 'Cognac Saddle Leather Sculptural Lounge Chair', mfg: 'Carl Hansen & Søn Style', retail: '$2,190', estLead: '3-4 weeks' },
      { item: 'Fluted Acoustic Oak Wall Cladding (18m²)', mfg: 'Atelier Architectural Millwork', retail: '$3,600', estLead: '2 weeks' }
    ];
    const pbrTextures = safeJsonParse(project.pbr_textures, {});

    // Create PDF Document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      info: {
        Title: `AtelierAI Spec Sheet - ${project.title}`,
        Author: 'AtelierAI Spatial Engine',
        Subject: 'Architectural Presentation & Material Specification'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="AtelierAI_Spec_${projectId}.pdf"`);

    doc.pipe(res);

    // --- Page 1: Dark Executive Architectural Cover & Overview ---
    // Full dark canvas background
    doc.rect(0, 0, 595.28, 841.89).fill('#0A0C10');

    // Header Gold Rule
    doc.rect(40, 45, 515, 3).fill('#D4AF37');

    // Brand Title
    doc.fillColor('#D4AF37')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text('ATELIER AI', 40, 60, { characterSpacing: 2 });

    doc.fillColor('#A0A5B5')
       .fontSize(10)
       .font('Helvetica')
       .text('INTERACTIVE 3D & 2D SPATIAL INTERIOR STUDIO', 40, 88, { characterSpacing: 1 });

    doc.fillColor('#E5E7EB')
       .fontSize(9)
       .text(`PROJECT ID: ${project.id}  |  DATE: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, 40, 105, { align: 'right', width: 515 });

    doc.moveDown(2);

    // Project Name Card
    doc.rect(40, 130, 515, 65).fill('#151820');
    doc.rect(40, 130, 4, 65).fill('#D4AF37'); // Accent vertical bar

    doc.fillColor('#FFFFFF')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(project.title || 'Architectural Living Room Concept', 55, 142);

    doc.fillColor('#9CA3AF')
       .fontSize(10)
       .font('Helvetica')
       .text(`Style Preset: ${project.style_preset || 'Japandi & Warm Minimalism'}   •   Lighting: ${project.diurnal_lighting || 'Morning Golden Hour'}`, 55, 168);

    // Architectural Prompt Section
    doc.fillColor('#D4AF37')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('DESIGN PROMPT & SPATIAL INTENT', 40, 215, { characterSpacing: 1 });

    doc.rect(40, 235, 515, 60).fill('#1B1F29');
    doc.fillColor('#D1D5DB')
       .fontSize(9)
       .font('Helvetica-Oblique')
       .text(
         project.current_prompt || 'Curated minimalist living space featuring textured bouclé seating, fluted timber acoustic panels, brushed brass accents, and diffused volumetric daylight.',
         50, 245, { width: 495, lineGap: 3 }
       );

    // Color Palette Swatches Section
    doc.fillColor('#D4AF37')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('CURATED ARCHITECTURAL PALETTE', 40, 315, { characterSpacing: 1 });

    let swatchX = 40;
    const swatchY = 335;
    const swatchWidth = 115;
    const swatchHeight = 40;

    colorSwatches.slice(0, 4).forEach((hex, i) => {
      // Swatch color box
      doc.rect(swatchX, swatchY, swatchWidth, swatchHeight).fill(hex);
      // Outer border
      doc.rect(swatchX, swatchY, swatchWidth, swatchHeight).lineWidth(0.5).stroke('#383F52');

      // Hex code label box below
      doc.rect(swatchX, swatchY + swatchHeight, swatchWidth, 28).fill('#1B1F29');
      doc.fillColor('#E5E7EB')
         .fontSize(8.5)
         .font('Helvetica-Bold')
         .text(hex.toUpperCase(), swatchX, swatchY + swatchHeight + 4, { width: swatchWidth, align: 'center' });
      doc.fillColor('#9CA3AF')
         .fontSize(6.5)
         .font('Helvetica')
         .text(pantoneReferences[i] || 'Pantone Custom Match', swatchX, swatchY + swatchHeight + 16, { width: swatchWidth, align: 'center' });

      swatchX += swatchWidth + 18;
    });

    // Estimated Budget & Retail Match References
    doc.fillColor('#D4AF37')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('FURNITURE SOURCING & ESTIMATED BUDGET SCHEDULE', 40, 420, { characterSpacing: 1 });

    let budgetY = 438;
    doc.rect(40, budgetY, 515, 20).fill('#1B1F29');
    doc.fillColor('#D4AF37').fontSize(8).font('Helvetica-Bold')
       .text('ITEM SPECIFICATION', 48, budgetY + 6)
       .text('RETAIL REFERENCE / MFG', 245, budgetY + 6)
       .text('EST. RETAIL', 415, budgetY + 6)
       .text('LEAD TIME', 480, budgetY + 6);

    budgetY += 20;

    budgetReferences.forEach((b, idx) => {
      const isEven = idx % 2 === 0;
      doc.rect(40, budgetY, 515, 18).fill(isEven ? '#151820' : '#11141A');
      doc.fillColor('#E5E7EB').fontSize(8).font('Helvetica')
         .text(b.item, 48, budgetY + 5, { width: 190, ellipsis: true })
         .text(b.mfg, 245, budgetY + 5, { width: 160, ellipsis: true })
         .text(b.retail, 415, budgetY + 5)
         .text(b.leadTime, 480, budgetY + 5);
      budgetY += 18;
    });

    // Material Specification Table Section
    doc.fillColor('#D4AF37')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('MATERIAL FINISHES & SPECIFICATIONS', 40, budgetY + 16, { characterSpacing: 1 });

    let tableY = budgetY + 34;
    doc.rect(40, tableY, 515, 20).fill('#1B1F29');
    doc.fillColor('#D4AF37').fontSize(8).font('Helvetica-Bold')
       .text('NO.', 48, tableY + 6)
       .text('MATERIAL / COMPONENT', 80, tableY + 6)
       .text('APPLICATION', 310, tableY + 6)
       .text('SURFACE FINISH', 440, tableY + 6);

    tableY += 20;

    materialsList.forEach((item, index) => {
      const isEven = index % 2 === 0;
      doc.rect(40, tableY, 515, 18).fill(isEven ? '#151820' : '#11141A');
      doc.fillColor('#E5E7EB').fontSize(8).font('Helvetica')
         .text(String(index + 1).padStart(2, '0'), 48, tableY + 5)
         .text(item, 80, tableY + 5, { width: 220, ellipsis: true })
         .text('Interior Architectural', 310, tableY + 5)
         .text('PBR Matte & Specular', 440, tableY + 5);
      tableY += 18;
    });

    // Digital Assets & 3D Links Card
    doc.fillColor('#D4AF37')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('DIGITAL ASSETS & 3D MESH LINKS', 40, tableY + 16, { characterSpacing: 1 });

    const assetY = tableY + 34;
    doc.rect(40, assetY, 515, 78).fill('#151820');
    doc.rect(40, assetY, 4, 78).fill('#383F52');

    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
       .text('2D Conceptual Render Output:', 52, assetY + 10);
    doc.fillColor('#60A5FA').fontSize(8).font('Helvetica')
       .text(project.render_2d_url || 'https://modelslab.com/renders/sample_render_8k.png', 52, assetY + 22, { underline: true, width: 480 });

    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
       .text('Interactive 3D GLB Asset (Meshy / Three.js / WebXR QuickLook):', 52, assetY + 42);
    doc.fillColor('#34D399').fontSize(8).font('Helvetica')
       .text(project.model_3d_url || 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb', 52, assetY + 54, { underline: true, width: 480 });

    // Footer
    doc.rect(40, 785, 515, 1).fill('#282D3B');
    doc.fillColor('#6B7280')
       .fontSize(8)
       .font('Helvetica')
       .text('Generated by AtelierAI Spatial Engine • Confidential Architectural Spec Sheet & Moodboard Presentation', 40, 795, { align: 'center', width: 515 });

    doc.end();
  } catch (err) {
    console.error('Spec PDF export error:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate specification PDF.'
      });
    }
  }
}
