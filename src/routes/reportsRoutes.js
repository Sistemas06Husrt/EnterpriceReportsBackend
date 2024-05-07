const { Router, request } = require('express');
const router = Router();
const BD = require('../config/configDb');

router.get('/citesCE', async (req, res) => {
    sql = `SELECT 
    SUBSTR(p.p_code,0,2) "Tipo_ID",
    SUBSTR(p.p_code,3)"Num_de_Identificacion",
    axs.APES_NAME3 "Estado_de_la_cita",
    ex.ex_code,
    ex.ex_description,
    p.p_born "Fecha_de_Nacimiento",
    FLOOR(trunc(months_between(a.ap_date,p.p_born)/12)) ||' Años '||FLOOR(MOD(months_between(a.ap_date, p.p_born),12)) ||' Meses '||FLOOR(a.ap_date - add_months(p.p_born, trunc(months_between(a.ap_date, p.p_born)))) ||' Dias' "EDAD",
    decode(p.p_sex,0,'I',1,'M',2,'F') "Sexo",
    p.p_name "Primer_Apellido",
    p.p_fname "Nombre_del_Paciente",
    pad.PA_TOWN "Municipio",
    ot.qpot_code "Modalidad", 
    prop.ASEGURADOR "Entidad",
    pvl.PLV_NAME1 "Aseguradora",
    prop.fECHAD "Fecha_Deseada",
    prop.tipoS "Tipo_Solicitu",
    prop.EAPB "EAPB",
    prop.TIPOU "Tipo_Usuario",
    s2.s_code,
    s2.s_name,
    to_char(a.Ap_Datemade,'YYYY/MM/DD HH24:MI') "F_Creacion_cita",
    to_char(a.ap_date+5*a.ap_startunit/1440,'YYYY/MM/DD HH24:MI') "Fecha_Cita",
    u.u_fname||' '||u.u_name "Usuario_que_asigna"
    FROM sysadm.appointments a
    INNER JOIN sysadm.patients p ON p.p_key=a.ap_patkey
    INNER JOIN sysadm.APPOINTMENT_EXAM_STATUS axs on axs.APES_KEY=a.AP_EXAM_STATUS
    INNER JOIN sysadm.examinations ex ON ex.ex_key = a.ap_examkey
    INNER JOIN sysadm.QPORDER_TYPE ot on ot.qpot_key=ex.EX_ORDERTYPE
    INNER JOIN sysadm.pat_addresses pad ON pad.PA_PATIENT=p.p_key
    INNER JOIN sysadm.users u ON a.ap_madeby=u.U_LOGINNAME
    LEFT OUTER JOIN sysadm.Services S2 ON S2.s_Key = a.Ap_Req_Service
    left OUTER JOIN (select obj.ol_l_appointment ol_l_appointment , MAX (DECODE(  PV_PROPERTY_DEF, 3, pv.PV_STRINGVALUE)) ASEGURADOR,   MAX (DECODE(  PV_PROPERTY_DEF, 11, pv.pv_datevalue)) fECHAD,  MAX (DECODE(  PV_PROPERTY_DEF, 12, pv.PV_STRINGVALUE)) tipoS, MAX (DECODE(  PV_PROPERTY_DEF, 13, pv.PV_STRINGVALUE)) EAPB,  MAX (DECODE(  PV_PROPERTY_DEF, 14, PV.PV_STRINGVALUE)) TIPOU ,  MAX (DECODE(  PV_PROPERTY_DEF, 15, PV.PV_STRINGVALUE)) ASEGURADORA
    from sysadm.property_values pv 
    LEFT JOIN  sysadm.objectlink obj ON pv.pv_key=obj.ol_r_property_value 
    WHERE PV_PROPERTY_DEF IN (3, 11, 12 , 13, 14, 15)
    GROUP BY obj.ol_l_appointment) prop ON prop.ol_l_appointment=a.ap_key
    LEFT OUTER JOIN  sysadm.property_lovs pvl ON pvl.plv_code=prop.ASEGURADORA
    where 1=1 
    and a.ap_date between to_date('01/04/2024', 'dd/mm/yyyy') and to_date('30/04/2024', 'dd/mm/yyyy')
    `;

    let result = await BD.Open(sql, [], false);
    Cites = [];
    previouscite = {}
    result.rows.map(cite => {
        if (cite[19] == "CONSULTA EXTERNA") {
            let userSchema = {
                "Tipo_de_Identificacion": cite[0],
                "Num_de_Identificacion": cite[1],
                "Estado_de_la_Cita": cite[2],
                "EX_CODE": cite[3],
                "EX_DESCRIPTION": cite[4],
                "Fecha_de_Nacimiento": cite[5],
                "Edad": cite[6],
                "Sexo": cite[7],
                "Primer_Apellido": cite[8],
                "Nombre_del_Paciente": cite[9],
                "Municipio": cite[10],
                "Modalidad": cite[11],
                "Entidad": cite[12],
                "Aseguradora": cite[13],
                "Fecha_Deseada": cite[14],
                "Tipo_Solicitud": cite[15],
                "EAPB": cite[16],
                "Tipo_Usuario": cite[17],
                "s_code": cite[18],
                "s_name": cite[19],
                "F_Creacion_Cita": cite[20],
                "Fecha_Cita": cite[21],
                "Usuario_que_Asigna": cite[22]
            }

            if (previouscite == {}) {
                Cites.push(userSchema);
            } else if ((previouscite.Num_de_Identificacion != userSchema.Num_de_Identificacion && previouscite.EX_CODE != userSchema)
                || (previouscite.Num_de_Identificacion != userSchema.Num_de_Identificacion && previouscite.EX_CODE == userSchema.EX_CODE)
                || (previouscite.Num_de_Identificacion == userSchema.Num_de_Identificacion && previouscite.EX_CODE != userSchema.EX_CODE)) {
                Cites.push(userSchema);
            }
            previouscite = userSchema;
        }
    })


    res.json(Cites);
})


router.post('/citesCEFecha', async (req, res) => {
    console.log(req.body);
    sql = `SELECT 
    SUBSTR(p.p_code,0,2) "Tipo_ID",
    SUBSTR(p.p_code,3)"Num_de_Identificacion",
    axs.APES_NAME3 "Estado_de_la_cita",
    ex.ex_code,
    ex.ex_description,
    p.p_born "Fecha_de_Nacimiento",
    FLOOR(trunc(months_between(a.ap_date,p.p_born)/12)) ||' Años '||FLOOR(MOD(months_between(a.ap_date, p.p_born),12)) ||' Meses '||FLOOR(a.ap_date - add_months(p.p_born, trunc(months_between(a.ap_date, p.p_born)))) ||' Dias' "EDAD",
    decode(p.p_sex,0,'I',1,'M',2,'F') "Sexo",
    p.p_name "Primer_Apellido",
    p.p_fname "Nombre_del_Paciente",
    pad.PA_TOWN "Municipio",
    ot.qpot_code "Modalidad", 
    prop.ASEGURADOR "Entidad",
    pvl.PLV_NAME1 "Aseguradora",
    prop.fECHAD "Fecha_Deseada",
    prop.tipoS "Tipo_Solicitu",
    prop.EAPB "EAPB",
    prop.TIPOU "Tipo_Usuario",
    s2.s_code,
    s2.s_name,
    to_char(a.Ap_Datemade,'YYYY/MM/DD HH24:MI') "F_Creacion_cita",
    to_char(a.ap_date+5*a.ap_startunit/1440,'YYYY/MM/DD HH24:MI') "Fecha_Cita",
    u.u_fname||' '||u.u_name "Usuario_que_asigna"
    FROM sysadm.appointments a
    INNER JOIN sysadm.patients p ON p.p_key=a.ap_patkey
    INNER JOIN sysadm.APPOINTMENT_EXAM_STATUS axs on axs.APES_KEY=a.AP_EXAM_STATUS
    INNER JOIN sysadm.examinations ex ON ex.ex_key = a.ap_examkey
    INNER JOIN sysadm.QPORDER_TYPE ot on ot.qpot_key=ex.EX_ORDERTYPE
    INNER JOIN sysadm.pat_addresses pad ON pad.PA_PATIENT=p.p_key
    INNER JOIN sysadm.users u ON a.ap_madeby=u.U_LOGINNAME
    LEFT OUTER JOIN sysadm.Services S2 ON S2.s_Key = a.Ap_Req_Service
    left OUTER JOIN (select obj.ol_l_appointment ol_l_appointment , MAX (DECODE(  PV_PROPERTY_DEF, 3, pv.PV_STRINGVALUE)) ASEGURADOR,   MAX (DECODE(  PV_PROPERTY_DEF, 11, pv.pv_datevalue)) fECHAD,  MAX (DECODE(  PV_PROPERTY_DEF, 12, pv.PV_STRINGVALUE)) tipoS, MAX (DECODE(  PV_PROPERTY_DEF, 13, pv.PV_STRINGVALUE)) EAPB,  MAX (DECODE(  PV_PROPERTY_DEF, 14, PV.PV_STRINGVALUE)) TIPOU ,  MAX (DECODE(  PV_PROPERTY_DEF, 15, PV.PV_STRINGVALUE)) ASEGURADORA
    from sysadm.property_values pv 
    LEFT JOIN  sysadm.objectlink obj ON pv.pv_key=obj.ol_r_property_value 
    WHERE PV_PROPERTY_DEF IN (3, 11, 12 , 13, 14, 15)
    GROUP BY obj.ol_l_appointment) prop ON prop.ol_l_appointment=a.ap_key
    LEFT OUTER JOIN  sysadm.property_lovs pvl ON pvl.plv_code=prop.ASEGURADORA
    where 1=1 
    and a.ap_date between to_date('` + req.body.fechaI + `', 'dd/mm/yyyy') and to_date ('` + req.body.fechaF + `', 'dd/mm/yyyy')
    `;
    let result = await BD.Open(sql, [], false);
    Cites = [];
    previouscite = {}
    result.rows.map(cite => {
        if (cite[19] == "CONSULTA EXTERNA") {
            let userSchema = {
                "Tipo_de_Identificacion": cite[0],
                "Num_de_Identificacion": cite[1],
                "Estado_de_la_Cita": cite[2],
                "EX_CODE": cite[3],
                "EX_DESCRIPTION": cite[4],
                "Fecha_de_Nacimiento": cite[5],
                "Edad": cite[6],
                "Sexo": cite[7],
                "Primer_Apellido": cite[8],
                "Nombre_del_Paciente": cite[9],
                "Municipio": cite[10],
                "Modalidad": cite[11],
                "Entidad": cite[12],
                "Aseguradora": cite[13],
                "Fecha_Deseada": cite[14],
                "Tipo_Solicitud": cite[15],
                "EAPB": cite[16],
                "Tipo_Usuario": cite[17],
                "s_code": cite[18],
                "s_name": cite[19],
                "F_Creacion_Cita": cite[20],
                "Fecha_Cita": cite[21],
                "Usuario_que_Asigna": cite[22]
            }

            if (previouscite == {}) {
                Cites.push(userSchema);
            } else if ((previouscite.Num_de_Identificacion != userSchema.Num_de_Identificacion && previouscite.EX_CODE != userSchema)
                || (previouscite.Num_de_Identificacion != userSchema.Num_de_Identificacion && previouscite.EX_CODE == userSchema.EX_CODE)
                || (previouscite.Num_de_Identificacion == userSchema.Num_de_Identificacion && previouscite.EX_CODE != userSchema.EX_CODE)) {
                Cites.push(userSchema);
            }
            previouscite = userSchema;
        }
    })


    res.json(Cites);
})

module.exports = router;