-- AddForeignKey
ALTER TABLE "test_links" ADD CONSTRAINT "test_links_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
