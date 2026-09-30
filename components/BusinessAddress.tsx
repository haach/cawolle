import Link from "next/link";
import type { FC } from "react";
import { Typography } from "@/components/atoms";
import { publicEmail, siteConfig } from "@/services/site";

type BusinessAddressProps = {
  linkEmail?: boolean;
};

export const BusinessAddress: FC<BusinessAddressProps> = ({ linkEmail = false }) => (
  <Typography variant="body">
    {siteConfig.name}
    <br />
    Inh. {siteConfig.owner}
    <br />
    {siteConfig.address.street}
    <br />
    {siteConfig.address.postalCode} {siteConfig.address.locality}
    <br />
    E-Mail:{" "}
    {linkEmail ? <Link href={`mailto:${siteConfig.email}`}>{publicEmail()}</Link> : publicEmail()}
  </Typography>
);
